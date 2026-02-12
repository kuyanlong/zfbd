import { useState, useCallback } from 'react';
import {
  getAllCategories,
  getCategoryTree,
  getCategoryDetail,
  getChildCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryPath,
  getCategoryStats,
} from '@/services/category';

export const useCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllCategories();
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取分类列表失败');
        return null;
      }
    } catch (err) {
      setError('获取分类列表失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategoryTree();
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取分类树失败');
        return null;
      }
    } catch (err) {
      setError('获取分类树失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategoryDetail(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取分类详情失败');
        return null;
      }
    } catch (err) {
      setError('获取分类详情失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChildCategories = useCallback(async (parentId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getChildCategories(parentId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取子分类失败');
        return null;
      }
    } catch (err) {
      setError('获取子分类失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewCategory = useCallback(async (
    name: string,
    description?: string,
    parentId: string | null = null,
    sortOrder: number = 0
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createCategory(name, description, parentId, sortOrder);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '创建分类失败');
        return null;
      }
    } catch (err) {
      setError('创建分类失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingCategory = useCallback(async (id: string, updates: Parameters<typeof updateCategory>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateCategory(id, updates);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '更新分类失败');
        return null;
      }
    } catch (err) {
      setError('更新分类失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteCategory(id);
      if (response.success) {
        return true;
      } else {
        setError(response.error || '删除分类失败');
        return false;
      }
    } catch (err) {
      setError('删除分类失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryPath = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategoryPath(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取分类路径失败');
        return null;
      }
    } catch (err) {
      setError('获取分类路径失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategoryStats();
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || '获取分类统计失败');
        return null;
      }
    } catch (err) {
      setError('获取分类统计失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllCategories,
    fetchCategoryTree,
    fetchCategoryDetail,
    fetchChildCategories,
    createNewCategory,
    updateExistingCategory,
    deleteExistingCategory,
    fetchCategoryPath,
    fetchCategoryStats,
  };
};
