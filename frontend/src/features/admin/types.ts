// 管理者関連の型定義
// 注: Admin型は features/auth/types.ts で定義されています

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
