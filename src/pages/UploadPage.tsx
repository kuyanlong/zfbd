import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WangEditor from '@/components/editor/WangEditor';
import { useAuth } from '@/hooks/useAuth';
import { useDocument } from '@/hooks/useDocument';
import { getCategories } from '@/services/db';
import type { Category, DocumentType, LawStatus } from '@/types';
import { LawStatusText } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout, loading: authLoading } = useAuth();
  const { createNewDocument } = useDocument();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    summary: '',
    documentNumber: '',
    issuingAuthority: '',
    effectiveDate: '',
    publishDate: '',
    categoryId: '',
    tags: [] as string[],
    type: 'text' as DocumentType,
    lawStatus: 'currently_effective' as LawStatus,
    requireAuth: false,
    fileContent: '', // base64 encoded file content
  });
  
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) return;
    
    // 检查登录状态
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/upload' } });
      return;
    }

    // 加载分类列表（包含二级分类）
    const cats = getCategories();
    // 获取所有二级分类
    const childCats = cats.filter(c => c.parentId !== null);
    // 为二级分类添加父分类名称前缀
    const catsWithParentName = childCats.map(child => {
      const parent = cats.find(c => c.id === child.parentId);
      return {
        ...child,
        displayName: parent ? `${parent.name} / ${child.name}` : child.name
      };
    });
    setCategories(catsWithParentName);
  }, [isLoggedIn, navigate, authLoading]);

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

  // 文件转base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // 移除 data:application/pdf;base64, 前缀
        const base64Content = base64.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('仅支持 PDF 和 Word 文档');
        return;
      }
      
      // 检查文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('文件大小不能超过 10MB');
        return;
      }
      
      setSelectedFile(file);
      
      // 将文件转换为base64
      let base64Content = '';
      try {
        base64Content = await fileToBase64(file);
      } catch (err) {
        console.error('文件转base64失败:', err);
      }
      
      // 尝试提取文本内容
      let extractedContent = '';
      try {
        if (file.type === 'application/pdf') {
          // PDF文件：使用pdfjs提取文本
          extractedContent = await extractPdfText(file);
        } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          // Word文件：使用mammoth提取文本
          extractedContent = await extractWordText(file);
        }
      } catch (err) {
        console.error('提取文本失败:', err);
        extractedContent = `[${file.name}]\n\n文件内容需要下载后查看。`;
      }
      
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: (file.type === 'application/pdf' ? 'pdf' : 'word') as DocumentType,
        content: extractedContent || `[${file.name}]\n\n文件内容需要下载后查看。`,
        fileContent: base64Content,
      }));
      setError('');
    }
  };
  
  // 提取PDF文本
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const pdfjs = await import('pdfjs-dist');
      // 使用CDN加载worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim() || `[${file.name}]\n\nPDF文件内容需要下载后查看。`;
    } catch (err) {
      console.error('PDF提取失败:', err);
      return `[${file.name}]\n\nPDF文件内容需要下载后查看。`;
    }
  };
  
  // 提取Word文本和图片
  const extractWordText = async (file: File): Promise<string> => {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      // 使用convertToHtml来保留图片
      const options: any = { 
        arrayBuffer,
        convertImage: mammoth.images.imgElement((image: any) => {
          return image.read("base64").then((imageBuffer: string) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`
            };
          });
        })
      };
      const result = await mammoth.convertToHtml(options);
      
      return result.value.trim() || `[${file.name}]\n\nWord文件内容需要下载后查看。`;
    } catch (err) {
      console.error('Word提取失败:', err);
      return `[${file.name}]\n\nWord文件内容需要下载后查看。`;
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入标题');
      return false;
    }
    if (!formData.categoryId) {
      setError('请选择分类');
      return false;
    }
    if (!formData.content.trim() && !selectedFile) {
      setError('请输入正文内容或上传文件');
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

    const response = await createNewDocument({
      ...formData,
      isPublic: true,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileContent: formData.fileContent,
      createdBy: user?.id || '',
    });

    if (response) {
      setShowSuccessDialog(true);
      // 重置表单
      setFormData({
        title: '',
        subtitle: '',
        content: '',
        summary: '',
        documentNumber: '',
        issuingAuthority: '',
        effectiveDate: '',
        publishDate: '',
        categoryId: '',
        tags: [],
        type: 'text' as DocumentType,
        lawStatus: 'currently_effective' as LawStatus,
        requireAuth: false,
        fileContent: '',
      });
      setSelectedFile(null);
    } else {
      setError('上传失败，请重试');
    }

    setLoading(false);
  };
  
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">上传法律法规</CardTitle>
                <CardDescription>
                  上传地方法律法规，提交后需要管理员审核通过才会公开发布
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">基本信息</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          标题 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="请输入法规标题"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryId">
                          分类 <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {(cat as any).displayName || cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lawStatus">
                          效力状态 <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={formData.lawStatus} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, lawStatus: v as LawStatus }))}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择效力状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="currently_effective">{LawStatusText.currently_effective}</SelectItem>
                            <SelectItem value="not_yet_effective">{LawStatusText.not_yet_effective}</SelectItem>
                            <SelectItem value="amended">{LawStatusText.amended}</SelectItem>
                            <SelectItem value="repealed">{LawStatusText.repealed}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* 发文信息 */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">发文信息</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentNumber">发文字号</Label>
                        <Input
                          id="documentNumber"
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={handleChange}
                          placeholder="如：中华人民共和国主席令第十五号"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="issuingAuthority">发文机关</Label>
                        <Input
                          id="issuingAuthority"
                          name="issuingAuthority"
                          value={formData.issuingAuthority}
                          onChange={handleChange}
                          placeholder="如：全国人民代表大会常务委员会"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="publishDate">发布日期</Label>
                        <Input
                          id="publishDate"
                          name="publishDate"
                          type="date"
                          value={formData.publishDate}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="effectiveDate">生效日期</Label>
                        <Input
                          id="effectiveDate"
                          name="effectiveDate"
                          type="date"
                          value={formData.effectiveDate}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">内容</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="summary">摘要</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        placeholder="请输入法规摘要（可选）"
                        rows={3}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">正文内容</Label>
                      <WangEditor
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        height={400}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>或上传文件</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            点击上传 PDF 或 Word 文件
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            支持 .pdf, .doc, .docx，最大 10MB
                          </span>
                        </label>
                        
                        {selectedFile && (
                          <div className="mt-4 flex items-center justify-center space-x-2">
                            <FileText className="w-4 h-4 text-red-700" />
                            <span className="text-sm">{selectedFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">标签</h3>
                    
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
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 权限设置 */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">权限设置</h3>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.requireAuth}
                        onChange={(e) => setFormData(prev => ({ ...prev, requireAuth: e.target.checked }))}
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">需要登录才能查看</span>
                    </label>
                  </div>

                  {/* 提交按钮 */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      className="w-full bg-red-700 hover:bg-red-800"
                      disabled={loading}
                    >
                      {loading ? '提交中...' : '提交审核'}
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      提交后需要管理员审核通过才会公开发布
                    </p>
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
              <CheckCircle className="w-8 h-8" />
              上传成功
            </DialogTitle>
            <DialogDescription className="text-center">
              文档上传成功，等待管理员审核通过后会公开发布
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

export default UploadPage;
