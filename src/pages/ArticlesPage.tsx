import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, ChevronRight, Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getPublishedArticles } from '@/services/article';
import type { Article, ArticleCategory } from '@/types';
import { ArticleCategoryText } from '@/types';

const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 从URL获取当前分类
  const currentCategory = searchParams.get('category') as ArticleCategory | null;

  useEffect(() => {
    const loadArticles = async () => {
      const response = await getPublishedArticles(1, 100, currentCategory || undefined);
      if (response.success && response.data) {
        setArticles(response.data.items);
      }
      setLoading(false);
    };

    loadArticles();
  }, [currentCategory]);
  
  // 分类选项
  const categories: { key: ArticleCategory | null; label: string }[] = [
    { key: null, label: '全部' },
    { key: 'news', label: ArticleCategoryText.news },
    { key: 'interpretation', label: ArticleCategoryText.interpretation },
    { key: 'help', label: ArticleCategoryText.help },
    { key: 'other', label: ArticleCategoryText.other },
  ];
  
  // 切换分类
  const handleCategoryChange = (category: ArticleCategory | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        {/* 页面头部 */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              文章专区
            </h1>
            <p className="text-gray-500">
              市场监管相关新闻、解读和资讯
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.key || 'all'}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (currentCategory === cat.key) || (cat.key === null && !currentCategory)
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
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
          ) : articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-700">
                          {article.title}
                        </h3>
                        {article.subtitle && (
                          <p className="text-sm text-gray-500 mb-2">{article.subtitle}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {ArticleCategoryText[article.category || 'news']}
                          </Badge>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(article.publishedAt || article.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {article.viewCount} 次浏览
                          </span>
                          <span>作者：{article.author}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
              <p className="text-gray-500">敬请期待更多内容</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticlesPage;
