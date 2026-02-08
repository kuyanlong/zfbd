import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FolderOpen, Scale, BookOpen, Shield, FileText, Gavel, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/types';
import { getCategoryTree, getChildCategories } from '@/services/category';
import { getDocuments } from '@/services/db';

interface CategoryWithCount extends Category {
  documentCount: number;
  children?: CategoryWithCount[];
}

const CategorySection: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons: Record<string, React.ElementType> = {
    'cat-1': Scale,
    'cat-2': BookOpen,
    'cat-3': Shield,
    'cat-4': FileText,
    'cat-5': Gavel,
    'cat-6': FolderOpen,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategoryTree();
      if (response.success && response.data) {
        const allDocuments = getDocuments();
        
        // 递归计算每个分类的文档数量
        const calculateCount = (cats: Category[]): CategoryWithCount[] => {
          return cats.map(cat => {
            const childCats = getChildCategories(cat.id);
            const childIds = childCats.success && childCats.data 
              ? childCats.data.map(c => c.id) 
              : [];
            
            const count = allDocuments.filter(d => 
              d.categoryId === cat.id || childIds.includes(d.categoryId)
            ).length;

            const children = childCats.success && childCats.data 
              ? calculateCount(childCats.data)
              : [];

            return {
              ...cat,
              documentCount: count,
              children: children.length > 0 ? children : undefined,
            };
          });
        };

        setCategories(calculateCount(response.data));
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const getIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || Building2;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">分类浏览</h2>
            <p className="text-gray-500">按类别浏览市场监管法律法规</p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center"
            onClick={() => navigate('/categories')}
          >
            查看全部
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 分类列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = getIcon(category.id);
              return (
                <Card 
                  key={category.id} 
                  className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/laws?category=${category.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                        <Icon className="w-7 h-7 text-red-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-700 transition-colors">
                            {category.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {category.documentCount} 部
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {category.description}
                        </p>
                        
                        {/* 子分类 */}
                        {category.children && category.children.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.children.slice(0, 3).map((child) => (
                              <span
                                key={child.id}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                              >
                                {child.name}
                              </span>
                            ))}
                            {category.children.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{category.children.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无分类</p>
          </div>
        )}

        {/* 移动端查看更多按钮 */}
        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/categories')}
          >
            查看全部
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
