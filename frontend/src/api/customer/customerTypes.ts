// カスタマー関連の型定義
// 注: Customer型は features/auth/types.ts で定義されています

import { ApiProduct } from './productTypes';

export interface CustomerFavorite {
  id: number;
  customerId: number;
  productId: number;
  createdAt: string;
}

// お気に入り一覧取得時のレスポンス型（商品情報含む）
export interface ApiFavorite {
  id: number;
  customerId: number;
  productId: number;
  product: ApiProduct;
  createdAt: string;
}
