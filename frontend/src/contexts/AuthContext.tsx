import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // トークンからユーザー情報を取得
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          setAdmin(data.user);
          setUser(null);
          setIsAdmin(true);
        } else {
          setUser(data.user);
          setAdmin(null);
          setIsAdmin(false);
        }
      } else {
        // トークンが無効な場合
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setAdmin(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
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
    setUser(null);
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
        user,
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
