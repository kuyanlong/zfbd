import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    const response = await login(formData.username, formData.password);
    
    if (response.success) {
      navigate('/');
    } else {
      setError(response.error || '登录失败');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 返回按钮 */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-700" />
            </div>
            <CardTitle className="text-2xl">用户登录</CardTitle>
            <CardDescription>
              登录后可以使用更多功能，包括收藏、下载、上传等
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名或邮箱</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="请输入用户名或邮箱"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600">记住我</span>
                </label>
                <Link to="/forgot-password" className="text-red-700 hover:text-red-800">
                  忘记密码？
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账号？{' '}
                <Link to="/register" className="text-red-700 hover:text-red-800 font-medium">
                  立即注册
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4">演示账号</p>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">管理员</p>
                  <p>用户名：admin</p>
                  <p>密码：admin123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">普通用户</p>
                  <p>需自行注册</p>
                  <p>或创建新账号</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
