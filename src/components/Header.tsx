import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  FileText,
  ChevronDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { User as UserType } from '@/types';

interface HeaderProps {
  user: Omit<UserType, 'password'> | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  onSearch?: (keyword: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  isLoggedIn, 
  isAdmin, 
  onLogout,
  onSearch 
}) => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      onSearch?.(searchKeyword.trim());
    }
  };

  const navItems = [
    { label: '首页', href: '/' },
    { label: '法律法规', href: '/laws' },
    { label: '分类浏览', href: '/categories' },
    { label: '最新发布', href: '/latest' },
    { label: '热门法规', href: '/hot' },
    { label: '文章专区', href: '/articles' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* 顶部栏 */}
      <div className="bg-red-700 text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              市场监管法律法规检索平台
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <span>欢迎，{user?.realName || user?.username}</span>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-200 transition-colors">登录</Link>
                <Link to="/register" className="hover:text-red-200 transition-colors">注册</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 主导航栏 */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">市场监管法规库</h1>
              <p className="text-xs text-gray-500">Market Regulation Law Database</p>
            </div>
          </Link>

          {/* 搜索框 - 桌面端 */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="搜索法律法规、发文字号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pr-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-700 hover:bg-red-800"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* 用户菜单 - 桌面端 */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-red-700" />
                    </div>
                    <span className="text-sm font-medium">{user?.realName || user?.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    个人中心
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-documents')}>
                    <FileText className="w-4 h-4 mr-2" />
                    我的上传
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="w-4 h-4 mr-2" />
                        管理后台
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin?tab=review')}>
                        <Shield className="w-4 h-4 mr-2" />
                        文档审核
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => navigate('/register')}>
                  注册
                </Button>
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 搜索框 - 移动端 */}
        <form onSubmit={handleSearch} className="mt-4 md:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="搜索法律法规..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pr-12"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-700 hover:bg-red-800"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* 导航链接 - 桌面端 */}
        <nav className="hidden md:flex items-center space-x-8 mt-4 pt-4 border-t border-gray-100">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-gray-600 hover:text-red-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              to="/upload"
              className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              上传法规
            </Link>
          )}
        </nav>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block py-2 text-gray-600 hover:text-red-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link
                  to="/upload"
                  className="block py-2 text-red-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  上传法规
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  个人中心
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    管理后台
                  </Link>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  退出登录
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
