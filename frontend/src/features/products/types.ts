// 商品関連の型定義

export interface Category {
  id: string;
  name: string;
  nameJa: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  nameJa: string;
  image: string;
  category: string;
  categoryJa: string;
  rating: number;
  reviewCount: number;
  description: string;
  descriptionJa: string;
}

// APIレスポンス用の型
export interface ApiCategory {
  id: string;
  name: string;
  nameJa: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  categoryId: string | null;
  category: ApiCategory | null;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  imageUrl: string;
  price: number | null;
  stockQuantity: number | null;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
