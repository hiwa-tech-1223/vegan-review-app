import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Admin, AuthContextType } from '../types';
import { authApi } from '../api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // トークンからユーザー情報を取得
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const data = await authApi.getCurrentUser(authToken);
      if (data.isAdmin) {
        setAdmin(data.admin);
        setCustomer(null);
        setIsAdmin(true);
      } else {
        setCustomer(data.customer);
        setAdmin(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setCustomer(null);
      setAdmin(null);
      setIsAdmin(false);
    }
  };

  // 初期化時にトークンがあればユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchCurrentUser(token);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // ログイン処理
  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchCurrentUser(newToken);
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCustomer(null);
    setAdmin(null);
    setIsAdmin(false);
  };

  // 認証ヘッダーを取得
  const getAuthHeader = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        admin,
        token,
        isLoading,
        isAdmin,
        login,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
