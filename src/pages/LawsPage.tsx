import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight, Calendar, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LawStatusBadge from '@/components/LawStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useDocument } from '@/hooks/useDocument';
import type { SearchResult } from '@/types';
import { getCategories, getCategoryById } from '@/services/db';
import type { Category } from '@/types';

const LawsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { fetchDocuments } = useDocument();
  
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // 加载分类列表
    const cats = getCategories();
    setCategories(cats);
    
    // 如果URL中有分类参数，获取当前分类信息
    const catId = searchParams.get('category');
    if (catId) {
      const cat = getCategoryById(catId);
      setCurrentCategory(cat || null);
      setSelectedCategory(catId);
    }
  }, [searchParams]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    
    const params = {
      categoryId: selectedCategory,
      page: currentPage,
      pageSize,
      sortBy: sortBy as 'date' | 'views',
    };

    const response = await fetchDocuments(params);
    
    if (response) {
      setResults(response);
    }
    
    setLoading(false);
  }, [selectedCategory, currentPage, sortBy, fetchDocuments]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    setSearchParams(params);
    
    // 更新当前分类信息
    const cat = getCategoryById(categoryId);
    setCurrentCategory(cat || null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取一级分类
  const rootCategories = categories.filter(c => c.parentId === null);

  const renderPagination = () => {
    if (!results || results.totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(results.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {start > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(1)}>
              1
            </Button>
            {start > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? 'bg-red-700 hover:bg-red-800' : ''}
          >
            {page}
          </Button>
        ))}
        
        {end < results.totalPages && (
          <>
            {end < results.totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(results.totalPages)}
            >
              {results.totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === results.totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
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
              法律法规
            </h1>
            <p className="text-gray-500">
              {currentCategory 
                ? `${currentCategory.name} - ${currentCategory.description || ''}`
                : '浏览全部市场监管系统法律法规'
              }
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏 - 分类筛选 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Filter className="w-4 h-4 mr-2" />
                    <h3 className="font-semibold">分类筛选</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedCategory 
                          ? 'bg-red-50 text-red-700 font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      全部法规
                    </button>
                    
                    {rootCategories.map(cat => (
                      <div key={cat.id}>
                        <button
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === cat.id 
                              ? 'bg-red-50 text-red-700 font-medium' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                        
                        {/* 子分类 */}
                        {selectedCategory === cat.id && (
                          <div className="ml-4 mt-1 space-y-1">
                            {categories
                              .filter(c => c.parentId === cat.id)
                              .map(child => (
                                <button
                                  key={child.id}
                                  onClick={() => handleCategoryChange(child.id)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    selectedCategory === child.id 
                                      ? 'bg-red-50 text-red-700 font-medium' 
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {child.name}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 主内容区 */}
            <div className="lg:col-span-3">
              {/* 排序和统计 */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-gray-600">
                  共 <span className="font-semibold text-red-700">{results?.total || 0}</span> 条结果
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">最新发布</SelectItem>
                    <SelectItem value="views">最多浏览</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 文档列表 */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : results?.documents.length ? (
                <div className="space-y-4">
                  {results.documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/document/${doc.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-red-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-700">
                              {doc.title}
                            </h3>
                            {doc.subtitle && (
                              <p className="text-sm text-gray-500 mb-2">{doc.subtitle}</p>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {doc.summary || doc.content.substring(0, 150) + '...'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <LawStatusBadge status={doc.lawStatus || 'currently_effective'} />
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(doc.effectiveDate || doc.publishDate)}
                              </span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {doc.viewCount} 次浏览
                              </span>
                              {doc.documentNumber && (
                                <Badge variant="secondary">{doc.documentNumber}</Badge>
                              )}
                              {doc.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
                  <p className="text-gray-500">该分类下暂时没有文档</p>
                </div>
              )}

              {/* 分页 */}
              {renderPagination()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LawsPage;
