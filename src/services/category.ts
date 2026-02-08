import type { Category, ApiResponse } from '@/types';
import { getCategories, getCategoryById, getCategoriesByParentId, saveCategory, deleteCategory as deleteCatFromDB, getDocuments } from './db';
import { getCurrentUser } from './db';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 获取所有分类
export const getAllCategories = (): ApiResponse<Category[]> => {
  const categories = getCategories();
  return {
    success: true,
    data: categories,
  };
};

// 获取分类树
export const getCategoryTree = (): ApiResponse<Category[]> => {
  const categories = getCategories();
  
  // 构建树形结构
  const buildTree = (parentId: string | null): Category[] => {
    const children = categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return children;
  };

  const tree = buildTree(null);
  return {
    success: true,
    data: tree,
  };
};

// 获取分类详情
export const getCategoryDetail = (id: string): ApiResponse<Category> => {
  const category = getCategoryById(id);
  
  if (!category) {
    return {
      success: false,
      error: '分类不存在',
    };
  }

  return {
    success: true,
    data: category,
  };
};

// 获取子分类
export const getChildCategories = (parentId: string | null): ApiResponse<Category[]> => {
  const categories = getCategoriesByParentId(parentId);
  return {
    success: true,
    data: categories,
  };
};

// 创建分类
export const createCategory = (
  name: string,
  description?: string,
  parentId: string | null = null,
  sortOrder: number = 0
): ApiResponse<Category> => {
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
      error: '无权创建分类',
    };
  }

  // 检查父分类是否存在
  let level = 1;
  if (parentId) {
    const parentCategory = getCategoryById(parentId);
    if (!parentCategory) {
      return {
        success: false,
        error: '父分类不存在',
      };
    }
    level = parentCategory.level + 1;
  }

  const newCategory: Category = {
    id: generateId(),
    name,
    description,
    parentId,
    level,
    sortOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveCategory(newCategory);

  return {
    success: true,
    data: newCategory,
    message: '分类创建成功',
  };
};

// 更新分类
export const updateCategory = (
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>
): ApiResponse<Category> => {
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
      error: '无权更新分类',
    };
  }

  const category = getCategoryById(id);
  
  if (!category) {
    return {
      success: false,
      error: '分类不存在',
    };
  }

  // 如果修改了父分类，需要更新层级
  if (updates.parentId !== undefined && updates.parentId !== category.parentId) {
    if (updates.parentId) {
      const parentCategory = getCategoryById(updates.parentId);
      if (!parentCategory) {
        return {
          success: false,
          error: '父分类不存在',
        };
      }
      updates.level = parentCategory.level + 1;
    } else {
      updates.level = 1;
    }
  }

  Object.assign(category, updates, { updatedAt: new Date().toISOString() });
  saveCategory(category);

  return {
    success: true,
    data: category,
    message: '分类更新成功',
  };
};

// 删除分类
export const deleteCategory = (id: string): ApiResponse<void> => {
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
      error: '无权删除分类',
    };
  }

  const category = getCategoryById(id);
  
  if (!category) {
    return {
      success: false,
      error: '分类不存在',
    };
  }

  // 检查是否有子分类
  const childCategories = getCategoriesByParentId(id);
  if (childCategories.length > 0) {
    return {
      success: false,
      error: '该分类下有子分类，无法删除',
    };
  }

  deleteCatFromDB(id);

  return {
    success: true,
    message: '分类删除成功',
  };
};

// 获取分类路径
export const getCategoryPath = (id: string): ApiResponse<Category[]> => {
  const category = getCategoryById(id);
  
  if (!category) {
    return {
      success: false,
      error: '分类不存在',
    };
  }

  const path: Category[] = [category];
  let currentId = category.parentId;

  while (currentId) {
    const parent = getCategoryById(currentId);
    if (parent) {
      path.unshift(parent);
      currentId = parent.parentId;
    } else {
      break;
    }
  }

  return {
    success: true,
    data: path,
  };
};

// 获取分类统计
export const getCategoryStats = (): ApiResponse<{ id: string; name: string; count: number }[]> => {
  const categories = getCategories();
  const documents = getDocuments();

  const stats = categories.map(category => {
    const count = documents.filter(
      (d: { categoryId: string }) => d.categoryId === category.id || d.categoryId.startsWith(`${category.id}-`)
    ).length;
    return {
      id: category.id,
      name: category.name,
      count,
    };
  });

  return {
    success: true,
    data: stats,
  };
};
