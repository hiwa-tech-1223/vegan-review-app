// 認証関連の型定義

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  memberSince?: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
}
