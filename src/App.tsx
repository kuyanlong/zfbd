import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SearchPage from '@/pages/SearchPage';
import DocumentDetailPage from '@/pages/DocumentDetailPage';
import LawsPage from '@/pages/LawsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import UploadPage from '@/pages/UploadPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import ArticlesPage from '@/pages/ArticlesPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import ArticleEditPage from '@/pages/ArticleEditPage';
import DocumentEditPage from '@/pages/DocumentEditPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/document/:id" element={<DocumentDetailPage />} />
        <Route path="/document/edit/:id" element={<DocumentEditPage />} />
        <Route path="/laws" element={<LawsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/latest" element={<LawsPage />} />
        <Route path="/hot" element={<LawsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-documents" element={<ProfilePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/article/new" element={<ArticleEditPage />} />
        <Route path="/article/edit/:id" element={<ArticleEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
