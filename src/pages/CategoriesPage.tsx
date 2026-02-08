import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  BookOpen, 
  Shield, 
  FileText, 
  Gavel, 
  FolderOpen,
  Building2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getCategoryTree, getChildCategories } from '@/services/category';
import { getDocuments } from '@/services/db';
import type { Category } from '@/types';

interface CategoryWithCount extends Category {
  documentCount: number;
  children?: CategoryWithCount[];
  isExpanded?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  'cat-1': Scale,
  'cat-2': BookOpen,
  'cat-3': Shield,
  'cat-4': FileText,
  'cat-5': Gavel,
  'cat-6': FolderOpen,
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || Building2;
  };

  const renderCategory = (category: CategoryWithCount, level: number = 0) => {
    const Icon = getIcon(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className={level > 0 ? 'ml-8 mt-2' : ''}>
        <Card 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            level > 0 ? 'border-l-4 border-l-red-200' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-4 flex-1"
                onClick={() => navigate(`/laws?category=${category.id}`)}
              >
                <div className={`w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-red-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-gray-900 hover:text-red-700 transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary">{category.documentCount} 部</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/laws?category=${category.id}`)}
                >
                  查看
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(category.id);
                    }}
                  >
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} 
                    />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 子分类 */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        {/* 页面头部 */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              分类浏览
            </h1>
            <p className="text-gray-500">
              按类别浏览市场监管系统法律法规，快速找到您需要的内容
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="space-y-4">
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
            <div className="space-y-4">
              {categories.map(category => renderCategory(category))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无分类</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoriesPage;
