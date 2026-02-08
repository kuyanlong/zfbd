// 用户角色
export type UserRole = 'guest' | 'user' | 'admin';
export const UserRole = {
  GUEST: 'guest' as const,
  USER: 'user' as const,
  ADMIN: 'admin' as const,
};

// 用户状态
export type UserStatus = 'pending' | 'active' | 'disabled';
export const UserStatus = {
  PENDING: 'pending' as const,
  ACTIVE: 'active' as const,
  DISABLED: 'disabled' as const,
};

// 文档状态（审核状态）
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'disabled';
export const DocumentStatus = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  DISABLED: 'disabled' as const,
};

// 法律法规效力状态
export type LawStatus = 'not_yet_effective' | 'currently_effective' | 'repealed' | 'amended';
export const LawStatus = {
  NOT_YET_EFFECTIVE: 'not_yet_effective' as const,
  CURRENTLY_EFFECTIVE: 'currently_effective' as const,
  REPEALED: 'repealed' as const,
  AMENDED: 'amended' as const,
};

// 效力状态显示文本
export const LawStatusText: Record<LawStatus, string> = {
  not_yet_effective: '尚未生效',
  currently_effective: '现行有效',
  repealed: '废止或失效',
  amended: '已经修改',
};

// 效力状态颜色
export const LawStatusColor: Record<LawStatus, string> = {
  not_yet_effective: 'bg-blue-100 text-blue-800',
  currently_effective: 'bg-green-100 text-green-800',
  repealed: 'bg-gray-100 text-gray-800',
  amended: 'bg-yellow-100 text-yellow-800',
};

// 文档类型
export type DocumentType = 'pdf' | 'word' | 'text';
export const DocumentType = {
  PDF: 'pdf' as const,
  WORD: 'word' as const,
  TEXT: 'text' as const,
};

// 文档接口
export interface Document {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  documentNumber?: string;  // 发文字号
  issuingAuthority?: string; // 发文机关
  effectiveDate?: string;    // 生效日期
  publishDate?: string;      // 发布日期
  invalidDate?: string;      // 废止日期
  status: DocumentStatus;
  lawStatus: LawStatus;      // 效力状态
  type: DocumentType;
  fileUrl?: string;
  fileSize?: number;
  fileName?: string;
  fileContent?: string;      // 文件二进制内容（base64）
  categoryId: string;
  tags: string[];
  viewCount: number;
  downloadCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  isPublic: boolean;
  requireAuth: boolean;
}

// 文章分类
export type ArticleCategory = 'news' | 'interpretation' | 'help' | 'other';
export const ArticleCategoryText: Record<ArticleCategory, string> = {
  news: '新闻资讯',
  interpretation: '法规解读',
  help: '帮助支持',
  other: '其他',
};

// 文章接口
export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  coverImage?: string;
  author: string;
  authorId: string;
  category: ArticleCategory;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 文档分类
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 搜索历史
export interface SearchHistory {
  id: string;
  userId: string;
  keyword: string;
  createdAt: string;
}

// 阅读记录
export interface ReadingRecord {
  id: string;
  userId: string;
  documentId: string;
  readAt: string;
  progress?: number;
}

// 下载记录
export interface DownloadRecord {
  id: string;
  userId: string;
  documentId: string;
  downloadedAt: string;
  ip?: string;
}

// 搜索条件
export interface SearchParams {
  keyword?: string;
  categoryId?: string;
  status?: DocumentStatus;
  lawStatus?: LawStatus;
  type?: DocumentType;
  dateFrom?: string;
  dateTo?: string;
  issuingAuthority?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'date' | 'views';
}

// 搜索结果
export interface SearchResult {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 登录响应
export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// API响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  realName?: string;
  organization?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
