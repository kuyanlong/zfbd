import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Scale, Shield, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const stats = [
    { icon: BookOpen, label: '法律法规', value: '2,500+' },
    { icon: Scale, label: '覆盖领域', value: '12+' },
    { icon: Shield, label: '权威来源', value: '100%' },
    { icon: TrendingUp, label: '日访问量', value: '10,000+' },
  ];

  const quickLinks = [
    { 
      title: '市场主体登记', 
      desc: '公司、企业登记管理法规',
      icon: FileText,
      href: '/laws?category=cat-1-1'
    },
    { 
      title: '反垄断与竞争', 
      desc: '反垄断、反不正当竞争法规',
      icon: Scale,
      href: '/laws?category=cat-1-2'
    },
    { 
      title: '消费者权益', 
      desc: '消费者权益保护法规',
      icon: Shield,
      href: '/laws?category=cat-1-3'
    },
    { 
      title: '产品质量安全', 
      desc: '产品质量、食品安全法规',
      icon: BookOpen,
      href: '/laws?category=cat-1-4'
    },
  ];

  return (
    <section className="bg-gradient-to-b from-red-50 to-white">
      {/* Hero主区域 */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            市场监管法律法规
            <span className="text-red-700">检索平台</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            全面、权威、便捷的市场监管法律法规数据库<br className="hidden md:block" />
            为您提供精准的法律检索服务
          </p>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Input
                type="text"
                placeholder="请输入关键词、法规名称、发文字号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-14 pl-6 pr-32 text-lg border-2 border-gray-200 rounded-full focus:border-red-500 focus:ring-red-500 shadow-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-700 hover:bg-red-800 rounded-full px-6"
              >
                <Search className="w-5 h-5 mr-2" />
                搜索
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>热门搜索：</span>
              {['公司法', '反垄断法', '食品安全法', '消费者权益保护法'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => navigate(`/search?keyword=${encodeURIComponent(term)}`)}
                  className="text-red-600 hover:text-red-800 hover:underline"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-red-700" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
              onClick={() => navigate(link.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <link.icon className="w-6 h-6 text-red-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-500">{link.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
