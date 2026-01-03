// ユーザー関連の型定義
// 注: User型は features/auth/types.ts で定義されています

export interface UserFavorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}
