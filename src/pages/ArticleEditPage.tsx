import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WangEditor from '@/components/editor/WangEditor';
import { useAuth } from '@/hooks/useAuth';
import { createArticle, updateArticle, getArticleDetail } from '@/services/article';
import type { ArticleCategory } from '@/types';
import { ArticleCategoryText } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ArticleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const { user, isLoggedIn, isAdmin, logout, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    summary: '',
    category: 'news' as ArticleCategory,
    tags: [] as string[],
    isPublished: false,
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isLoggedIn) {
      navigate('/login', { state: { from: isEditMode ? `/article/edit/${id}` : '/article/new' } });
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // 如果是编辑模式，加载文章数据
    if (isEditMode && id) {
      loadArticle(id);
    }
  }, [isLoggedIn, isAdmin, navigate, authLoading, id, isEditMode]);

  const loadArticle = async (articleId: string) => {
    const response = await getArticleDetail(articleId);
    if (response.success && response.data) {
      const article = response.data;
      setFormData({
        title: article.title,
        subtitle: article.subtitle || '',
        content: article.content,
        summary: article.summary || '',
        category: article.category || 'news',
        tags: article.tags || [],
        isPublished: article.isPublished,
      });
    } else {
      setError('文章不存在或加载失败');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入标题');
      return false;
    }
    if (!formData.content.trim()) {
      setError('请输入正文内容');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    let response;
    if (isEditMode && id) {
      response = await updateArticle(id, formData);
      if (response.success) {
        setSuccessMessage('文章更新成功！');
      }
    } else {
      response = await createArticle({
        ...formData,
        author: user?.realName || user?.username || '管理员',
        authorId: user?.id || '',
      });
      if (response.success) {
        setSuccessMessage('文章发布成功！');
      }
    }

    if (response.success) {
      setShowSuccessDialog(true);
    } else {
      setError(response.error || '操作失败，请重试');
    }

    setLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate('/admin?tab=articles');
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => navigate('/admin?tab=articles')}
            className="mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回文章管理
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="px-4 md:px-6">
                <CardTitle className="text-xl md:text-2xl">
                  {isEditMode ? '编辑文章' : '发布文章'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="px-4 md:px-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        文章标题 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="请输入文章标题"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">副标题</Label>
                      <Input
                        id="subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        placeholder="请输入副标题（可选）"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">文章分类</Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ArticleCategory }))}
                          className="w-full border border-gray-300 rounded-md p-2"
                          disabled={loading}
                        >
                          <option value="news">{ArticleCategoryText.news}</option>
                          <option value="interpretation">{ArticleCategoryText.interpretation}</option>
                          <option value="help">{ArticleCategoryText.help}</option>
                          <option value="other">{ArticleCategoryText.other}</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                            disabled={loading}
                          />
                          立即发布
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">摘要</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        placeholder="请输入文章摘要（可选）"
                        rows={3}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* 正文内容 */}
                  <div className="space-y-2">
                    <Label>
                      正文内容 <span className="text-red-500">*</span>
                    </Label>
                    <WangEditor
                      value={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      height={400}
                    />
                  </div>

                  {/* 标签 */}
                  <div className="space-y-2">
                    <Label>标签</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="输入标签后按添加"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={loading}
                      >
                        添加
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 提交按钮 */}
                  <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin?tab=articles')}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-red-700 hover:bg-red-800"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? '保存中...' : (isEditMode ? '保存修改' : '发布文章')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* 成功提示弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              操作成功
            </DialogTitle>
            <DialogDescription className="text-center">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={handleSuccessClose} className="bg-red-700 hover:bg-red-800">
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleEditPage;
