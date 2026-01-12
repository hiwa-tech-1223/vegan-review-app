// レビュー関連の型定義

import { ApiProduct } from '../products/types';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

// APIレスポンス用の型
export interface ApiReview {
  id: number;
  productId: number;
  userId: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  } | null;
  product?: ApiProduct;  // マイページ用（ユーザーのレビュー一覧取得時に含まれる）
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
