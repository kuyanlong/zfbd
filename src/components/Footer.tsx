import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Phone, Mail, MapPin } from 'lucide-react';
import type { Article } from '@/types';
import { getArticles } from '@/services/db';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [helpArticles, setHelpArticles] = useState<Article[]>([]);

  useEffect(() => {
    // 获取"帮助支持"类别的文章
    const articles = getArticles();
    const helpArticles = articles
      .filter(a => a.category === 'help' && a.isPublished)
      .slice(0, 4);
    setHelpArticles(helpArticles);
  }, []);

  const footerLinks = [
    {
      title: '快速链接',
      links: [
        { label: '首页', href: '/' },
        { label: '法律法规', href: '/laws' },
        { label: '分类浏览', href: '/categories' },
        { label: '最新发布', href: '/latest' },
      ],
    },
    {
      title: '用户服务',
      links: [
        { label: '用户注册', href: '/register' },
        { label: '用户登录', href: '/login' },
        { label: '上传法规', href: '/upload' },
        { label: '个人中心', href: '/profile' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo和简介 */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">市场监管法规库</h2>
                <p className="text-xs text-gray-400">Market Regulation Law Database</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              本平台致力于收集、整理和发布市场监管系统相关法律法规，为市场主体、监管人员和公众提供便捷、权威的法律检索服务。
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-red-500" />
                <span>010-12345678</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                <span>contact@marketlaw.gov.cn</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span>北京市西城区三里河东路8号</span>
              </div>
            </div>
          </div>

          {/* 链接列表 */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 帮助支持 - 动态显示文章 */}
          <div>
            <h3 className="text-white font-semibold mb-4">帮助支持</h3>
            <ul className="space-y-2">
              {helpArticles.length > 0 ? (
                helpArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/article/${article.id}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors line-clamp-1"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      to="/articles?category=help"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      使用指南
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/articles?category=help"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      常见问题
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/articles?category=help"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      意见反馈
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/articles?category=help"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      联系我们
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              <p>© {currentYear} 市场监管法律法规检索平台 版权所有</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-white transition-colors">
                隐私政策
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                使用条款
              </Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">
                网站地图
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-600">
            <p>本站提供的法律法规仅供参考，请以官方发布的正式文本为准</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
