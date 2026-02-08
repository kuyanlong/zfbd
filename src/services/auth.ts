import type { User, LoginResponse, ApiResponse } from '@/types';
import { UserRole, UserStatus } from '@/types';
import { 
  getUserByUsername, 
  getUserByEmail, 
  saveUser, 
  setCurrentUser, 
  setToken,
  getCurrentUser as getStoredCurrentUser,
  getToken as getStoredToken
} from './db';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 生成Token
const generateToken = (userId: string): string => {
  return `token-${userId}-${Date.now()}`;
};

// 注册用户
export const register = (
  username: string,
  email: string,
  password: string,
  realName?: string,
  organization?: string,
  phone?: string
): ApiResponse<Omit<User, 'password'>> => {
  // 检查用户名是否已存在
  const existingUserByUsername = getUserByUsername(username);
  if (existingUserByUsername) {
    return {
      success: false,
      error: '用户名已存在',
    };
  }

  // 检查邮箱是否已存在
  const existingUserByEmail = getUserByEmail(email);
  if (existingUserByEmail) {
    return {
      success: false,
      error: '邮箱已被注册',
    };
  }

  // 创建新用户
  const newUser: User = {
    id: generateId(),
    username,
    email,
    password,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    realName,
    organization,
    phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUser(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  return {
    success: true,
    data: userWithoutPassword,
    message: '注册成功',
  };
};

// 用户登录
export const login = (usernameOrEmail: string, password: string): ApiResponse<LoginResponse> => {
  // 查找用户（支持用户名或邮箱登录）
  let user = getUserByUsername(usernameOrEmail);
  if (!user) {
    user = getUserByEmail(usernameOrEmail);
  }

  if (!user) {
    return {
      success: false,
      error: '用户不存在',
    };
  }

  // 检查密码
  if (user.password !== password) {
    return {
      success: false,
      error: '密码错误',
    };
  }

  // 检查用户状态
  if (user.status === UserStatus.PENDING) {
    return {
      success: false,
      error: '账号待审核，请联系管理员',
    };
  }

  if (user.status === UserStatus.DISABLED) {
    return {
      success: false,
      error: '账号已被禁用，请联系管理员',
    };
  }

  // 更新最后登录时间
  user.lastLoginAt = new Date().toISOString();
  saveUser(user);

  // 生成Token
  const token = generateToken(user.id);

  // 存储当前用户和Token
  const { password: _, ...userWithoutPassword } = user;
  setCurrentUser(userWithoutPassword);
  setToken(token);

  return {
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
    message: '登录成功',
  };
};

// 用户登出
export const logout = (): void => {
  setCurrentUser(null);
  setToken(null);
};

// 获取当前用户
export const getCurrentUser = (): Omit<User, 'password'> | null => {
  return getStoredCurrentUser();
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getStoredToken() && !!getStoredCurrentUser();
};

// 检查是否为管理员
export const isAdmin = (): boolean => {
  const user = getStoredCurrentUser();
  return user?.role === UserRole.ADMIN;
};

// 修改密码
export const changePassword = (
  _userId: string,
  oldPassword: string,
  newPassword: string
): ApiResponse<void> => {
  const user = getUserByUsername(getStoredCurrentUser()?.username || '');
  
  if (!user) {
    return {
      success: false,
      error: '用户不存在',
    };
  }

  if (user.password !== oldPassword) {
    return {
      success: false,
      error: '原密码错误',
    };
  }

  user.password = newPassword;
  user.updatedAt = new Date().toISOString();
  saveUser(user);

  return {
    success: true,
    message: '密码修改成功',
  };
};

// 更新用户信息
export const updateUserInfo = (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'password' | 'role' | 'createdAt'>>
): ApiResponse<Omit<User, 'password'>> => {
  const user = getUserByUsername(getStoredCurrentUser()?.username || '');
  
  if (!user) {
    return {
      success: false,
      error: '用户不存在',
    };
  }

  // 检查是否有权限修改
  if (user.id !== userId && user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: '无权修改此用户信息',
    };
  }

  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  saveUser(user);

  const { password: _, ...userWithoutPassword } = user;
  
  // 如果修改的是当前用户，更新存储的用户信息
  if (user.id === getStoredCurrentUser()?.id) {
    setCurrentUser(userWithoutPassword);
  }

  return {
    success: true,
    data: userWithoutPassword,
    message: '用户信息更新成功',
  };
};

// 初始化认证状态（页面刷新时调用）
export const initAuth = (): void => {
  const token = getStoredToken();
  const user = getStoredCurrentUser();
  
  if (!token || !user) {
    logout();
  }
};
