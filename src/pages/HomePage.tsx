import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import LatestDocumentsSection from '@/sections/LatestDocumentsSection';
import HotDocumentsSection from '@/sections/HotDocumentsSection';
import CategorySection from '@/sections/CategorySection';
import ArticlesSection from '@/sections/ArticlesSection';
import { useAuth } from '@/hooks/useAuth';
import { initDatabase } from '@/services/db';

const HomePage: React.FC = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  useEffect(() => {
    // 初始化数据库
    initDatabase();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        onLogout={logout} 
      />
      
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <LatestDocumentsSection />
        <HotDocumentsSection />
        <ArticlesSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
