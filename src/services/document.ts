import type { Document, SearchParams, SearchResult, ApiResponse } from '@/types';
import { DocumentStatus } from '@/types';
import { 
  getDocuments, 
  getDocumentById, 
  saveDocument, 
  deleteDocument as deleteDocFromDB,
  getCurrentUser,
  saveReadingRecord,
  saveDownloadRecord
} from './db';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 获取文档列表
export const getDocumentList = (params: SearchParams = {}): ApiResponse<SearchResult> => {
  const {
    keyword,
    categoryId,
    status = DocumentStatus.APPROVED,
    lawStatus,
    type,
    dateFrom,
    dateTo,
    issuingAuthority,
    page = 1,
    pageSize = 10,
    sortBy = 'date',
  } = params;

  let documents = getDocuments();

  // 筛选状态
  if (status) {
    documents = documents.filter(d => d.status === status);
  }

  // 筛选效力状态
  if (lawStatus) {
    documents = documents.filter(d => d.lawStatus === lawStatus);
  }

  // 筛选分类
  if (categoryId) {
    documents = documents.filter(d => d.categoryId === categoryId || d.categoryId.startsWith(`${categoryId}-`));
  }

  // 筛选类型
  if (type) {
    documents = documents.filter(d => d.type === type);
  }

  // 筛选发文机关
  if (issuingAuthority) {
    documents = documents.filter(d => 
      d.issuingAuthority?.toLowerCase().includes(issuingAuthority.toLowerCase())
    );
  }

  // 筛选日期范围
  if (dateFrom) {
    documents = documents.filter(d => {
      const date = d.effectiveDate || d.publishDate;
      return date && date >= dateFrom;
    });
  }
  if (dateTo) {
    documents = documents.filter(d => {
      const date = d.effectiveDate || d.publishDate;
      return date && date <= dateTo;
    });
  }

  // 关键词搜索（标题、内容、发文字号）
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    documents = documents.filter(d => 
      d.title.toLowerCase().includes(searchTerm) ||
      d.content.toLowerCase().includes(searchTerm) ||
      d.documentNumber?.toLowerCase().includes(searchTerm) ||
      d.summary?.toLowerCase().includes(searchTerm) ||
      d.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // 排序
  switch (sortBy) {
    case 'date':
      documents.sort((a, b) => {
        const dateA = new Date(b.effectiveDate || b.publishDate || b.createdAt);
        const dateB = new Date(a.effectiveDate || a.publishDate || a.createdAt);
        return dateA.getTime() - dateB.getTime();
      });
      break;
    case 'views':
      documents.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case 'relevance':
    default:
      // 默认按相关度排序（如果有搜索词，匹配的标题优先）
      if (keyword) {
        const searchTerm = keyword.toLowerCase().trim();
        documents.sort((a, b) => {
          const aInTitle = a.title.toLowerCase().includes(searchTerm);
          const bInTitle = b.title.toLowerCase().includes(searchTerm);
          if (aInTitle && !bInTitle) return -1;
          if (!aInTitle && bInTitle) return 1;
          return b.viewCount - a.viewCount;
        });
      }
      break;
  }

  const total = documents.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDocuments = documents.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: {
      documents: paginatedDocuments,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
};

// 获取文档详情
export const getDocumentDetail = (id: string): ApiResponse<Document> => {
  const document = getDocumentById(id);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  // 检查权限
  const currentUser = getCurrentUser();
  if (document.requireAuth && !currentUser) {
    return {
      success: false,
      error: '请先登录后查看此文档',
    };
  }

  // 增加浏览次数
  document.viewCount++;
  saveDocument(document);

  // 记录阅读历史
  if (currentUser) {
    saveReadingRecord({
      id: generateId(),
      userId: currentUser.id,
      documentId: id,
      readAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    data: document,
  };
};

// 创建文档
export const createDocument = (
  data: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'downloadCount' | 'status'>
): ApiResponse<Document> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  const newDocument: Document = {
    ...data,
    id: generateId(),
    status: DocumentStatus.PENDING, // 新文档需要审核
    viewCount: 0,
    downloadCount: 0,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveDocument(newDocument);

  return {
    success: true,
    data: newDocument,
    message: '文档提交成功，等待审核',
  };
};

// 更新文档
export const updateDocument = (
  id: string,
  updates: Partial<Omit<Document, 'id' | 'createdAt' | 'createdBy'>>
): ApiResponse<Document> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  const document = getDocumentById(id);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  // 检查权限（只有管理员或文档创建者可以修改）
  if (currentUser.role !== 'admin' && document.createdBy !== currentUser.id) {
    return {
      success: false,
      error: '无权修改此文档',
    };
  }

  Object.assign(document, updates, { updatedAt: new Date().toISOString() });
  saveDocument(document);

  return {
    success: true,
    data: document,
    message: '文档更新成功',
  };
};

// 审核文档
export const reviewDocument = (
  id: string,
  status: DocumentStatus,
  comment?: string
): ApiResponse<Document> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  // 检查是否为管理员
  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权审核文档',
    };
  }

  const document = getDocumentById(id);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  document.status = status;
  document.reviewedBy = currentUser.id;
  document.reviewedAt = new Date().toISOString();
  document.reviewComment = comment;
  document.updatedAt = new Date().toISOString();

  saveDocument(document);

  const message = status === DocumentStatus.APPROVED 
    ? '文档审核通过' 
    : status === DocumentStatus.REJECTED 
    ? '文档已拒绝' 
    : '文档状态已更新';

  return {
    success: true,
    data: document,
    message,
  };
};

// 删除文档
export const deleteDocument = (id: string): ApiResponse<void> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  const document = getDocumentById(id);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  // 检查权限（只有管理员或文档创建者可以删除）
  if (currentUser.role !== 'admin' && document.createdBy !== currentUser.id) {
    return {
      success: false,
      error: '无权删除此文档',
    };
  }

  deleteDocFromDB(id);

  return {
    success: true,
    message: '文档删除成功',
  };
};

// 获取待审核文档列表
export const getPendingDocuments = (page: number = 1, pageSize: number = 10): ApiResponse<SearchResult> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  // 检查是否为管理员
  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权查看待审核文档',
    };
  }

  return getDocumentList({ 
    status: DocumentStatus.PENDING, 
    page, 
    pageSize 
  });
};

// 获取用户上传的文档
export const getUserDocuments = (userId: string, page: number = 1, pageSize: number = 10): ApiResponse<SearchResult> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  // 检查权限
  if (currentUser.id !== userId && currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权查看此用户的文档',
    };
  }

  const documents = getDocuments().filter(d => d.createdBy === userId);
  const total = documents.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDocuments = documents.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: {
      documents: paginatedDocuments,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
};

// 记录下载
export const recordDownload = (documentId: string): ApiResponse<void> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  const document = getDocumentById(documentId);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  // 增加下载次数
  document.downloadCount++;
  saveDocument(document);

  // 记录下载历史
  saveDownloadRecord({
    id: generateId(),
    userId: currentUser.id,
    documentId,
    downloadedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: '下载记录已保存',
  };
};

// 获取热门文档
export const getHotDocuments = (limit: number = 10): ApiResponse<Document[]> => {
  const documents = getDocuments()
    .filter(d => d.status === DocumentStatus.APPROVED)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);

  return {
    success: true,
    data: documents,
  };
};

// 获取最新文档
export const getLatestDocuments = (limit: number = 10): ApiResponse<Document[]> => {
  const documents = getDocuments()
    .filter(d => d.status === DocumentStatus.APPROVED)
    .sort((a, b) => {
      const dateA = new Date(b.effectiveDate || b.publishDate || b.createdAt);
      const dateB = new Date(a.effectiveDate || a.publishDate || a.createdAt);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, limit);

  return {
    success: true,
    data: documents,
  };
};

// 全文搜索
export const fullTextSearch = (keyword: string, page: number = 1, pageSize: number = 10): ApiResponse<SearchResult> => {
  if (!keyword || !keyword.trim()) {
    return {
      success: false,
      error: '请输入搜索关键词',
    };
  }

  return getDocumentList({ 
    keyword, 
    page, 
    pageSize,
    sortBy: 'relevance'
  });
};

// 获取相关文档
export const getRelatedDocuments = (documentId: string, limit: number = 5): ApiResponse<Document[]> => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return {
      success: false,
      error: '文档不存在',
    };
  }

  // 查找同分类的其他文档
  const relatedDocuments = getDocuments()
    .filter(d => 
      d.id !== documentId && 
      d.status === DocumentStatus.APPROVED &&
      (d.categoryId === document.categoryId || 
       d.tags.some(tag => document.tags.includes(tag)))
    )
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);

  return {
    success: true,
    data: relatedDocuments,
  };
};
