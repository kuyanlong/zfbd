import { useState, useCallback } from 'react';
import type { SearchParams } from '@/types';
import {
  getDocumentList,
  getDocumentDetail,
  createDocument,
  updateDocument,
  reviewDocument,
  deleteDocument,
  fullTextSearch,
  getHotDocuments,
  getLatestDocuments,
  getRelatedDocuments,
  getPendingDocuments,
  getUserDocuments,
  recordDownload,
} from '@/services/document';

export const useDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (params: SearchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDocumentList(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取文档列表失败');
        return null;
      }
    } catch (err) {
      setError('获取文档列表失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDocumentDetail(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取文档详情失败');
        return null;
      }
    } catch (err) {
      setError('获取文档详情失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewDocument = useCallback(async (data: Parameters<typeof createDocument>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createDocument(data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '创建文档失败');
        return null;
      }
    } catch (err) {
      setError('创建文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingDocument = useCallback(async (id: string, updates: Parameters<typeof updateDocument>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateDocument(id, updates);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '更新文档失败');
        return null;
      }
    } catch (err) {
      setError('更新文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewExistingDocument = useCallback(async (id: string, status: Parameters<typeof reviewDocument>[1], comment?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewDocument(id, status, comment);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '审核文档失败');
        return null;
      }
    } catch (err) {
      setError('审核文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteDocument(id);
      if (response.success) {
        return true;
      } else {
        setError(response.error || '删除文档失败');
        return false;
      }
    } catch (err) {
      setError('删除文档失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (keyword: string, page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fullTextSearch(keyword, page, pageSize);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '搜索失败');
        return null;
      }
    } catch (err) {
      setError('搜索失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHotDocuments = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHotDocuments(limit);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取热门文档失败');
        return null;
      }
    } catch (err) {
      setError('获取热门文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestDocuments = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLatestDocuments(limit);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取最新文档失败');
        return null;
      }
    } catch (err) {
      setError('获取最新文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatedDocuments = useCallback(async (documentId: string, limit: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRelatedDocuments(documentId, limit);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取相关文档失败');
        return null;
      }
    } catch (err) {
      setError('获取相关文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingDocuments = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingDocuments(page, pageSize);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取待审核文档失败');
        return null;
      }
    } catch (err) {
      setError('获取待审核文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserDocuments = useCallback(async (userId: string, page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserDocuments(userId, page, pageSize);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取用户文档失败');
        return null;
      }
    } catch (err) {
      setError('获取用户文档失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recordDownload(documentId);
      if (response.success) {
        return true;
      } else {
        setError(response.error || '记录下载失败');
        return false;
      }
    } catch (err) {
      setError('记录下载失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchDocuments,
    fetchDocumentDetail,
    createNewDocument,
    updateExistingDocument,
    reviewExistingDocument,
    deleteExistingDocument,
    searchDocuments,
    fetchHotDocuments,
    fetchLatestDocuments,
    fetchRelatedDocuments,
    fetchPendingDocuments,
    fetchUserDocuments,
    downloadDocument,
  };
};
