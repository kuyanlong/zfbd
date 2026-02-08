import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useDocument } from '@/hooks/useDocument';
import LawStatusBadge from '@/components/LawStatusBadge';
import type { Document, Category, Article, LawStatus } from '@/types';
import { DocumentStatus, LawStatusText, ArticleCategoryText } from '@/types';
import { getUsers, getDocuments, getCategories, getArticles } from '@/services/db';
import { createCategory, updateCategory, deleteCategory } from '@/services/category';
import { deleteArticle, toggleArticlePublish } from '@/services/article';
import { deleteDocument } from '@/services/document';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn, isAdmin, logout, loading: authLoading } = useAuth();
  
  // 从URL参数获取当前标签页
  const defaultTab = searchParams.get('tab') || 'review';
  const { fetchPendingDocuments, reviewExistingDocument } = useDocument();
  
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewLawStatus, setReviewLawStatus] = useState<LawStatus>('currently_effective');
  
  // 分页状态
  const [docPage, setDocPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const pageSize = 20;
  
  // 分类管理状态
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentId: '',
    sortOrder: 0,
  });
  


  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) return;
    
    // 检查权限
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadData();
  }, [isLoggedIn, isAdmin, navigate, authLoading]);

  const loadData = async () => {
    setIsLoading(true);
    
    // 加载待审核文档
    const pendingResponse = await fetchPendingDocuments(1, 100);
    if (pendingResponse) {
      setPendingDocs(pendingResponse.documents);
    }
    
    // 加载所有文档 - 按创建时间逆序排列
    const docs = getDocuments().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllDocs(docs);
    
    // 加载用户列表
    const userList = getUsers();
    setUsers(userList);
    
    // 加载分类列表
    const cats = getCategories();
    setCategories(cats);
    
    // 加载文章列表 - 按发布时间/创建时间逆序排列
    const arts = getArticles().sort((a, b) => {
      const dateA = new Date(b.publishedAt || b.createdAt).getTime();
      const dateB = new Date(a.publishedAt || a.createdAt).getTime();
      return dateA - dateB;
    });
    setArticles(arts);
    
    setIsLoading(false);
  };

  const handleReview = async () => {
    if (!selectedDoc || !reviewAction) return;
    
    const status = reviewAction === 'approve' ? DocumentStatus.APPROVED : DocumentStatus.REJECTED;
    const response = await reviewExistingDocument(selectedDoc.id, status, reviewComment);
    
    // 如果审核通过，更新效力状态
    if (response && reviewAction === 'approve') {
      const { updateDocument } = await import('@/services/document');
      await updateDocument(selectedDoc.id, { lawStatus: reviewLawStatus });
    }
    
    if (response) {
      setShowReviewDialog(false);
      setSelectedDoc(null);
      setReviewComment('');
      setReviewAction(null);
      loadData();
    }
  };

  const openReviewDialog = (doc: Document, action: 'approve' | 'reject') => {
    setSelectedDoc(doc);
    setReviewAction(action);
    setReviewLawStatus(doc.lawStatus || 'currently_effective');
    setShowReviewDialog(true);
  };
  
  // 分类管理函数
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        parentId: '',
        sortOrder: 0,
      });
    }
    setShowCategoryDialog(true);
  };
  
  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;
    
    const parentId = categoryForm.parentId || null;
    
    if (editingCategory) {
      const response = updateCategory(editingCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        parentId: parentId,
        sortOrder: categoryForm.sortOrder,
      });
      if (response.success) {
        loadData();
        setShowCategoryDialog(false);
      }
    } else {
      const response = createCategory(
        categoryForm.name,
        categoryForm.description,
        parentId,
        categoryForm.sortOrder
      );
      if (response.success) {
        loadData();
        setShowCategoryDialog(false);
      }
    }
  };
  
  const handleDeleteCategory = (id: string) => {
    if (confirm('确定要删除这个分类吗？')) {
      const response = deleteCategory(id);
      if (response.success) {
        loadData();
      } else {
        alert(response.error);
      }
    }
  };
  
  const handleDeleteArticle = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      const response = deleteArticle(id);
      if (response.success) {
        loadData();
      }
    }
  };
  
  const handleToggleArticlePublish = (id: string) => {
    const response = toggleArticlePublish(id);
    if (response.success) {
      loadData();
    }
  };
  
  const handleDeleteDocument = (id: string) => {
    if (confirm('确定要删除这个文档吗？此操作不可恢复。')) {
      const response = deleteDocument(id);
      if (response.success) {
        loadData();
      } else {
        alert(response.error || '删除失败');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const stats = [
    { 
      title: '总文档数', 
      value: allDocs.length, 
      icon: FileText, 
      color: 'bg-blue-500' 
    },
    { 
      title: '待审核', 
      value: pendingDocs.length, 
      icon: Clock, 
      color: 'bg-yellow-500' 
    },
    { 
      title: '已发布', 
      value: allDocs.filter(d => d.status === DocumentStatus.APPROVED).length, 
      icon: CheckCircle, 
      color: 'bg-green-500' 
    },
    { 
      title: '注册用户', 
      value: users.length, 
      icon: Users, 
      color: 'bg-purple-500' 
    },
  ];

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-500">管理系统内容、用户和文档审核</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <LogOut className="w-4 h-4 mr-2" />
              退出管理
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 标签页 */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="review">
                <Clock className="w-4 h-4 mr-2" />
                文档审核
                {pendingDocs.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{pendingDocs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                文档管理
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                用户管理
              </TabsTrigger>
              <TabsTrigger value="categories">
                <FolderOpen className="w-4 h-4 mr-2" />
                分类管理
              </TabsTrigger>
              <TabsTrigger value="articles">
                <FileText className="w-4 h-4 mr-2" />
                文章管理
              </TabsTrigger>
            </TabsList>

            {/* 文档审核 */}
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle>待审核文档</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingDocs.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">没有待审核的文档</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {doc.summary || doc.content.substring(0, 100) + '...'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>提交时间：{formatDate(doc.createdAt)}</span>
                                <span>分类：{doc.categoryId}</span>
                                <LawStatusBadge status={doc.lawStatus || 'currently_effective'} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/document/${doc.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openReviewDialog(doc, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openReviewDialog(doc, 'reject')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 文档管理 */}
            <TabsContent value="documents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>文档列表</CardTitle>
                  <span className="text-sm text-gray-500">
                    共 {allDocs.length} 条，第 {docPage} 页
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allDocs.slice((docPage - 1) * pageSize, docPage * pageSize).map(doc => (
                      <div
                        key={doc.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                              <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                {doc.status === 'approved' ? '已发布' : 
                                 doc.status === 'pending' ? '待审核' : '已拒绝'}
                              </Badge>
                              <LawStatusBadge status={doc.lawStatus || 'currently_effective'} />
                              <span>{doc.viewCount} 次浏览</span>
                              <span>{doc.downloadCount} 次下载</span>
                              <span>类型：{doc.type === 'pdf' ? 'PDF' : doc.type === 'word' ? 'Word' : '文本'}</span>
                              <span>创建：{new Date(doc.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/document/${doc.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/document/edit/${doc.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 分页 */}
                  {allDocs.length > pageSize && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocPage(p => Math.max(1, p - 1))}
                        disabled={docPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {docPage} / {Math.ceil(allDocs.length / pageSize)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocPage(p => Math.min(Math.ceil(allDocs.length / pageSize), p + 1))}
                        disabled={docPage >= Math.ceil(allDocs.length / pageSize)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 用户管理 */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>用户列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map(u => (
                      <div
                        key={u.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-red-700" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {u.realName || u.username}
                                {u.role === 'admin' && (
                                  <Badge variant="destructive" className="ml-2">管理员</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            注册时间：{formatDate(u.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 分类管理 */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>分类管理</CardTitle>
                  <Button onClick={() => openCategoryDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加分类
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories
                      .filter(c => c.parentId === null)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(cat => (
                      <div key={cat.id} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                            <p className="text-sm text-gray-500">{cat.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openCategoryDialog(cat)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* 子分类 */}
                        {categories.filter(c => c.parentId === cat.id).length > 0 && (
                          <div className="p-4 pl-8 space-y-2">
                            {categories
                              .filter(c => c.parentId === cat.id)
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map(child => (
                                <div key={child.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded">
                                  <div>
                                    <span className="font-medium text-gray-900">{child.name}</span>
                                    <p className="text-sm text-gray-500">{child.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openCategoryDialog(child)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(child.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 文章管理 */}
            <TabsContent value="articles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>文章管理</CardTitle>
                    <span className="text-sm text-gray-500">
                      共 {articles.length} 条，第 {articlePage} 页
                    </span>
                  </div>
                  <Button onClick={() => navigate('/article/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    发布文章
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">暂无文章</p>
                      </div>
                    ) : (
                      articles.slice((articlePage - 1) * pageSize, articlePage * pageSize).map(article => (
                        <div key={article.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                                  {article.isPublished ? '已发布' : '草稿'}
                                </Badge>
                                <Badge variant="outline">{ArticleCategoryText[article.category || 'news']}</Badge>
                                <span>作者：{article.author}</span>
                                <span>浏览：{article.viewCount}</span>
                                <span>发布时间：{formatDate(article.publishedAt || article.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleArticlePublish(article.id)}
                              >
                                {article.isPublished ? '取消发布' : '发布'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => navigate(`/article/edit/${article.id}`)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteArticle(article.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* 分页 */}
                  {articles.length > pageSize && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArticlePage(p => Math.max(1, p - 1))}
                        disabled={articlePage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {articlePage} / {Math.ceil(articles.length / pageSize)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArticlePage(p => Math.min(Math.ceil(articles.length / pageSize), p + 1))}
                        disabled={articlePage >= Math.ceil(articles.length / pageSize)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />

      {/* 审核对话框 */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? '通过审核' : '拒绝审核'}
            </DialogTitle>
            <DialogDescription>
              {selectedDoc?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {reviewAction === 'approve' && (
              <div>
                <label className="text-sm font-medium">效力状态</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  value={reviewLawStatus}
                  onChange={(e) => setReviewLawStatus(e.target.value as LawStatus)}
                >
                  <option value="currently_effective">{LawStatusText.currently_effective}</option>
                  <option value="not_yet_effective">{LawStatusText.not_yet_effective}</option>
                  <option value="amended">{LawStatusText.amended}</option>
                  <option value="repealed">{LawStatusText.repealed}</option>
                </select>
              </div>
            )}
            <Textarea
              placeholder="请输入审核意见（可选）"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleReview}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewAction === 'approve' ? '通过' : '拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 分类管理对话框 */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑分类' : '添加分类'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">分类名称</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="请输入分类名称"
              />
            </div>
            <div>
              <label className="text-sm font-medium">分类描述</label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="请输入分类描述"
              />
            </div>
            <div>
              <label className="text-sm font-medium">父分类</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={categoryForm.parentId}
                onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value})}
              >
                <option value="">无（作为一级分类）</option>
                {categories
                  .filter(c => c.parentId === null)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">排序</label>
              <Input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm({...categoryForm, sortOrder: parseInt(e.target.value) || 0})}
                placeholder="数字越小排序越靠前"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default AdminPage;
