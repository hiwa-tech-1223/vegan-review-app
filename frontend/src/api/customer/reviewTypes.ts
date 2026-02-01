// レビュー関連の型定義

import { ApiProduct } from './productTypes';

export interface Review {
  id: number;
  productId: number;
  customerId: number;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

// APIレスポンス用の型
export interface ApiReview {
  id: number;
  productId: number;
  customerId: number;
  customer: {
    id: number;
    name: string;
    avatar: string;
  } | null;
  product?: ApiProduct;  // マイページ用（カスタマーのレビュー一覧取得時に含まれる）
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
