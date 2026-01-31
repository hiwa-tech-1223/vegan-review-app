// カテゴリ管理関連の型定義

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

// カテゴリフォームデータ
export interface CategoryFormData {
  name: string;
  nameJa: string;
}
