// 管理者関連の型定義
// 注: Admin型は features/auth/types.ts で定義されています

import { User } from '../auth/types';

// 管理画面で表示するユーザー情報（Userを拡張）
export interface ManagedUser extends User {
  reviewCount: number;
  status: 'active' | 'banned' | 'suspended';
  statusReason?: string;
  suspendedUntil?: string;
}

export interface AdminCategory {
  en: string;
  ja: string;
}

export const ADMIN_CATEGORIES: AdminCategory[] = [
  { en: 'Meat Alternatives', ja: '代替肉' },
  { en: 'Dairy', ja: '乳製品代替' },
  { en: 'Snacks', ja: 'スナック' },
  { en: 'Beverages', ja: '飲料' },
  { en: 'Seasonings', ja: '調味料' }
];
