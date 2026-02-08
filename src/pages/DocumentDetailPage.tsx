import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Share2, 
  Bookmark, 
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilePreview from '@/components/FilePreview';
import LawStatusBadge from '@/components/LawStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useDocument } from '@/hooks/useDocument';
import type { Document, Category } from '@/types';
import { getCategoryPath } from '@/services/category';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { fetchDocumentDetail, fetchRelatedDocuments, downloadDocument } = useDocument();
  
  const [doc, setDoc] = useState<Document | null>(null);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      
      setLoading(true);
      setError('');
      
      const response = await fetchDocumentDetail(id);
      
      if (response) {
        setDoc(response);
        
        // 获取分类路径
        const pathResponse = await getCategoryPath(response.categoryId);
        if (pathResponse.success && pathResponse.data) {
          setCategoryPath(pathResponse.data);
        }
        
        // 获取相关文档
        const relatedResponse = await fetchRelatedDocuments(id, 5);
        if (relatedResponse) {
          setRelatedDocs(relatedResponse);
        }
      } else {
        setError('文档不存在或无权查看');
      }
      
      setLoading(false);
    };

    loadDocument();
  }, [id, fetchDocumentDetail, fetchRelatedDocuments]);

  const handleDownload = async () => {
    if (!doc) return;
    
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/document/${doc.id}` } });
      return;
    }

    await downloadDocument(doc.id);
    
    // 根据文档类型下载原文件
    if (doc.fileContent) {
      // 有文件内容，下载原文件
      const mimeType = doc.type === 'pdf' ? 'application/pdf' : 
                       doc.type === 'word' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
                       'text/plain';
      const extension = doc.type === 'pdf' ? 'pdf' : 
                        doc.type === 'word' ? 'docx' : 
                        'txt';
      const fileName = doc.fileName || `${doc.title}.${extension}`;
      
      // 将base64转换为blob
      const byteCharacters = atob(doc.fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // 纯文本内容
      const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.title}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: doc?.title || '',
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
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

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">出错了</h2>
            <p className="text-gray-500 mb-4">{error || '文档不存在'}</p>
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
              <Link to="/" className="hover:text-red-700">首页</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link to="/laws" className="hover:text-red-700">法律法规</Link>
              {categoryPath.map((cat) => (
                <React.Fragment key={cat.id}>
                  <ChevronRight className="w-4 h-4 mx-2" />
                  <Link 
                    to={`/laws?category=${cat.id}`} 
                    className="hover:text-red-700"
                  >
                    {cat.name}
                  </Link>
                </React.Fragment>
              ))}
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
                      {doc.title}
                    </h1>
                    {doc.subtitle && (
                      <p className="text-lg text-gray-600">{doc.subtitle}</p>
                    )}
                  </div>

                  {/* 元信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                    {doc.documentNumber && (
                      <div>
                        <span className="text-gray-500">发文字号：</span>
                        <span className="text-gray-900">{doc.documentNumber}</span>
                      </div>
                    )}
                    {doc.issuingAuthority && (
                      <div>
                        <span className="text-gray-500">发文机关：</span>
                        <span className="text-gray-900">{doc.issuingAuthority}</span>
                      </div>
                    )}
                    {doc.publishDate && (
                      <div>
                        <span className="text-gray-500">发布日期：</span>
                        <span className="text-gray-900">{formatDate(doc.publishDate)}</span>
                      </div>
                    )}
                    {doc.effectiveDate && (
                      <div>
                        <span className="text-gray-500">生效日期：</span>
                        <span className="text-gray-900">{formatDate(doc.effectiveDate)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">效力状态：</span>
                      <LawStatusBadge status={doc.lawStatus || 'currently_effective'} />
                    </div>
                  </div>

                  {/* 标签 */}
                  {doc.tags.length > 0 && (
                    <div className="mb-8">
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 摘要 */}
                  {doc.summary && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">摘要</h3>
                      <p className="text-gray-600">{doc.summary}</p>
                    </div>
                  )}

                  {/* 正文内容 */}
                  <div className="prose max-w-none">
                    <h3 className="font-semibold text-gray-900 mb-4">正文</h3>
                    {doc.type === 'pdf' || doc.type === 'word' ? (
                      <FilePreview
                        fileName={doc.fileName}
                        fileType={doc.type}
                        fileContent={doc.fileContent}
                        onDownload={handleDownload}
                      />
                    ) : (
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                      />
                    )}
                  </div>

                  {/* 底部统计 */}
                  <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {doc.viewCount} 次浏览
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {doc.downloadCount} 次下载
                      </span>
                    </div>
                    <div>
                      最后更新：{formatDate(doc.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 操作按钮 */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button 
                    className="w-full bg-red-700 hover:bg-red-800" 
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载文档
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-red-700 text-red-700' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 相关文档 */}
              {relatedDocs.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">相关文档</h3>
                    <div className="space-y-3">
                      {relatedDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => navigate(`/document/${doc.id}`)}
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-red-700">
                            {doc.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.viewCount} 次浏览
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 文档信息 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">文档信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">文档类型</span>
                      <span className="text-gray-900 uppercase">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">状态</span>
                      <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                        {doc.status === 'approved' ? '已发布' : doc.status}
                      </Badge>
                    </div>
                    {doc.requireAuth && (
                      <Alert className="mt-4">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>此文档需要登录后查看</AlertDescription>
                      </Alert>
                    )}
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

export default DocumentDetailPage;
