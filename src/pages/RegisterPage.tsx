import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, Building, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    realName: '',
    organization: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (formData.username.length < 3) {
      setError('用户名至少3个字符');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (!formData.password) {
      setError('请输入密码');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码至少6个字符');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
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

    const response = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.realName,
      formData.organization,
      formData.phone
    );
    
    if (response.success) {
      navigate('/login');
    } else {
      setError(response.error || '注册失败');
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
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-700" />
            </div>
            <CardTitle className="text-2xl">用户注册</CardTitle>
            <CardDescription>
              注册账号后即可上传地方法律法规、收藏文档等
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    用户名 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="至少3个字符"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    邮箱 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    密码 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="至少6个字符"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    确认密码 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="再次输入密码"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-4">选填信息</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="realName">真实姓名</Label>
                    <Input
                      id="realName"
                      name="realName"
                      type="text"
                      placeholder="您的真实姓名"
                      value={formData.realName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">所属单位</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="organization"
                        name="organization"
                        type="text"
                        placeholder="您的工作单位"
                        value={formData.organization}
                        onChange={handleChange}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="phone">联系电话</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="您的联系电话"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreement"
                  className="mt-1"
                  required
                />
                <label htmlFor="agreement" className="text-sm text-gray-600">
                  我已阅读并同意
                  <Link to="/terms" className="text-red-700 hover:text-red-800">使用条款</Link>
                  和
                  <Link to="/privacy" className="text-red-700 hover:text-red-800">隐私政策</Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800"
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账号？{' '}
                <Link to="/login" className="text-red-700 hover:text-red-800 font-medium">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
