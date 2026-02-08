import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { 
  login as authLogin, 
  logout as authLogout, 
  register as authRegister,
  getCurrentUser, 
  isAuthenticated, 
  isAdmin 
} from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化时检查登录状态
    const initAuth = () => {
      const currentUser = getCurrentUser();
      const authenticated = isAuthenticated();
      setUser(currentUser);
      setIsLoggedIn(authenticated);
      setIsAdminUser(isAdmin());
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const response = await authLogin(usernameOrEmail, password);
    if (response.success) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
      setIsAdminUser(isAdmin());
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setIsLoggedIn(false);
    setIsAdminUser(false);
  }, []);

  const register = useCallback(async (
    username: string, 
    email: string, 
    password: string,
    realName?: string,
    organization?: string,
    phone?: string
  ) => {
    const response = await authRegister(username, email, password, realName, organization, phone);
    return response;
  }, []);

  const refreshUser = useCallback(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoggedIn(isAuthenticated());
    setIsAdminUser(isAdmin());
  }, []);

  return {
    user,
    isLoggedIn,
    isAdmin: isAdminUser,
    loading,
    login,
    logout,
    register,
    refreshUser,
  };
};
