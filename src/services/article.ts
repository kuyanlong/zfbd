import type { Article, ArticleCategory, ApiResponse, PaginatedResponse } from '@/types';
import { getArticles, getArticleById, saveArticle, deleteArticle as deleteArtFromDB, getCurrentUser } from './db';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 获取已发布文章列表
export const getPublishedArticles = (page: number = 1, pageSize: number = 10, category?: ArticleCategory): ApiResponse<PaginatedResponse<Article>> => {
  let articles = getArticles()
    .filter(a => a.isPublished);
  
  // 如果指定了分类，进行筛选
  if (category) {
    articles = articles.filter(a => a.category === category);
  }
  
  articles = articles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  
  const total = articles.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedArticles = articles.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: {
      items: paginatedArticles,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
};

// 获取文章列表（别名，兼容旧代码）
export const getArticleList = getPublishedArticles;

// 获取所有文章（管理员用）
export const getAllArticles = (page: number = 1, pageSize: number = 10): ApiResponse<PaginatedResponse<Article>> => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权访问',
    };
  }

  const articles = getArticles().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const total = articles.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedArticles = articles.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    data: {
      items: paginatedArticles,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
};

// 获取文章详情
export const getArticleDetail = (id: string): ApiResponse<Article> => {
  const article = getArticleById(id);
  
  if (!article) {
    return {
      success: false,
      error: '文章不存在',
    };
  }

  // 增加浏览次数
  article.viewCount++;
  saveArticle(article);

  return {
    success: true,
    data: article,
  };
};

// 创建文章
export const createArticle = (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): ApiResponse<Article> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权发布文章',
    };
  }

  const newArticle: Article = {
    ...data,
    id: generateId(),
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveArticle(newArticle);

  return {
    success: true,
    data: newArticle,
    message: '文章发布成功',
  };
};

// 更新文章
export const updateArticle = (id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>): ApiResponse<Article> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权更新文章',
    };
  }

  const article = getArticleById(id);
  
  if (!article) {
    return {
      success: false,
      error: '文章不存在',
    };
  }

  Object.assign(article, updates, { updatedAt: new Date().toISOString() });
  saveArticle(article);

  return {
    success: true,
    data: article,
    message: '文章更新成功',
  };
};

// 删除文章
export const deleteArticle = (id: string): ApiResponse<void> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return {
      success: false,
      error: '请先登录',
    };
  }

  if (currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权删除文章',
    };
  }

  const article = getArticleById(id);
  
  if (!article) {
    return {
      success: false,
      error: '文章不存在',
    };
  }

  deleteArtFromDB(id);

  return {
    success: true,
    message: '文章删除成功',
  };
};

// 发布/取消发布文章
export const toggleArticlePublish = (id: string): ApiResponse<Article> => {
  const currentUser = getCurrentUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return {
      success: false,
      error: '无权操作',
    };
  }

  const article = getArticleById(id);
  
  if (!article) {
    return {
      success: false,
      error: '文章不存在',
    };
  }

  article.isPublished = !article.isPublished;
  if (article.isPublished && !article.publishedAt) {
    article.publishedAt = new Date().toISOString();
  }
  article.updatedAt = new Date().toISOString();
  
  saveArticle(article);

  return {
    success: true,
    data: article,
    message: article.isPublished ? '文章已发布' : '文章已取消发布',
  };
};
