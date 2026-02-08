import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getArticleDetail } from '@/services/article';
import type { Article } from '@/types';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      
      setLoading(true);
      const response = await getArticleDetail(id);
      
      if (response.success && response.data) {
        setArticle(response.data);
      } else {
        setError('文章不存在或无权查看');
      }
      
      setLoading(false);
    };

    loadArticle();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-6 w-2/3 mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">出错了</h2>
            <p className="text-gray-500 mb-4">{error || '文章不存在'}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        {/* 面包屑导航 */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/" className="hover:text-blue-700">首页</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link to="/articles" className="hover:text-blue-700">文章专区</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900">正文</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 主内容区 */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  {/* 标题区 */}
                  <div className="text-center mb-8 pb-8 border-b border-gray-200">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {article.title}
                    </h1>
                    {article.subtitle && (
                      <p className="text-lg text-gray-600">{article.subtitle}</p>
                    )}
                  </div>

                  {/* 元信息 */}
                  <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-500">
                    <span>作者：{article.author}</span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.viewCount} 次浏览
                    </span>
                  </div>

                  {/* 标签 */}
                  {article.tags.length > 0 && (
                    <div className="mb-8 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 摘要 */}
                  {article.summary && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 italic">{article.summary}</p>
                    </div>
                  )}

                  {/* 正文内容 */}
                  <div 
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* 底部操作 */}
                  <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigate('/articles')}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返回列表
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">文章信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">作者</span>
                      <span className="text-gray-900">{article.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">发布时间</span>
                      <span className="text-gray-900">{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">浏览次数</span>
                      <span className="text-gray-900">{article.viewCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
