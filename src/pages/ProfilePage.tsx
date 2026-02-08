import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail,
  Phone,
  Calendar, 
  FileText, 
  Clock,
  Edit,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useDocument } from '@/hooks/useDocument';
import type { Document } from '@/types';
import { getReadingRecords } from '@/services/db';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout, loading: authLoading } = useAuth();
  const { fetchUserDocuments } = useDocument();
  
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    email: '',
    organization: '',
    phone: '',
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) return;
    
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    if (user) {
      setFormData({
        realName: user.realName || '',
        email: user.email || '',
        organization: user.organization || '',
        phone: user.phone || '',
      });
    }

    loadData();
  }, [isLoggedIn, user, navigate, authLoading]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // 加载用户上传的文档
    const docsResponse = await fetchUserDocuments(user.id, 1, 10);
    if (docsResponse) {
      setMyDocuments(docsResponse.documents);
    }
    
    // 加载阅读历史
    const records = getReadingRecords(user.id);
    setReadingHistory(records.slice(0, 10));
    
    setIsLoading(false);
  };

  const handleSave = () => {
    // 这里应该调用更新用户信息的API
    setSuccess('信息更新成功');
    setIsEditing(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏 - 用户信息 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-red-700" />
                    </div>
                    <h2 className="text-xl font-bold">{user?.realName || user?.username}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'} className="mt-2">
                      {user?.role === 'admin' ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      注册时间：{formatDate(user?.createdAt)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      最后登录：{formatDate(user?.lastLoginAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 主内容区 */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="bg-white">
                  <TabsTrigger value="info">基本信息</TabsTrigger>
                  <TabsTrigger value="documents">我的上传</TabsTrigger>
                  <TabsTrigger value="history">阅读历史</TabsTrigger>
                  <TabsTrigger value="security">安全设置</TabsTrigger>
                </TabsList>

                {/* 基本信息 */}
                <TabsContent value="info">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>基本信息</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? '取消' : '编辑'}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {success && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                          <AlertDescription className="text-green-800">{success}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>用户名</Label>
                            <Input value={user?.username} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>真实姓名</Label>
                            <Input
                              value={formData.realName}
                              onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>邮箱</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>所属单位</Label>
                            <Input
                              value={formData.organization}
                              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>联系电话</Label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        {isEditing && (
                          <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800">
                            保存修改
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 我的上传 */}
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>我的上传</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myDocuments.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">您还没有上传过文档</p>
                          <Button 
                            className="mt-4 bg-red-700 hover:bg-red-800"
                            onClick={() => navigate('/upload')}
                          >
                            上传文档
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myDocuments.map(doc => (
                            <div
                              key={doc.id}
                              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors"
                              onClick={() => navigate(`/document/${doc.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900">{doc.title}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                                      {doc.status === 'approved' ? '已发布' : 
                                       doc.status === 'pending' ? '待审核' : '已拒绝'}
                                    </Badge>
                                    <span>提交时间：{formatDate(doc.createdAt)}</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  查看
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 阅读历史 */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>阅读历史</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {readingHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">暂无阅读记录</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {readingHistory.map(record => (
                            <div
                              key={record.id}
                              className="p-4 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    阅读时间：{formatDate(record.readAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 安全设置 */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>安全设置</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <Lock className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h3 className="font-medium">修改密码</h3>
                              <p className="text-sm text-gray-500">定期修改密码可以保护账号安全</p>
                            </div>
                          </div>
                          <Button variant="outline">修改</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h3 className="font-medium">邮箱绑定</h3>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                          <Badge variant="default">已绑定</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h3 className="font-medium">手机绑定</h3>
                              <p className="text-sm text-gray-500">
                                {user?.phone || '未绑定手机号'}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline">
                            {user?.phone ? '更换' : '绑定'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
