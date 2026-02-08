import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '@/types';
import { getPublishedArticles } from '@/services/article';

const ArticlesSection: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await getPublishedArticles(1, 6);
      if (response.success && response.data) {
        // 只显示非"帮助支持"分类的文章
        const filteredArticles = response.data.items.filter(
          a => a.category !== 'help'
        );
        setArticles(filteredArticles.slice(0, 6));
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">文章专区</h2>
            <p className="text-gray-500">市场监管相关新闻、解读和资讯</p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center"
            onClick={() => navigate('/articles')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 文章列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {article.title}
                      </h3>
                      {article.subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{article.subtitle}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.viewCount} 次浏览
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无文章</p>
          </div>
        )}

        {/* 移动端查看更多按钮 */}
        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/articles')}
          >
            查看更多
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
