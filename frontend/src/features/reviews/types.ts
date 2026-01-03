// レビュー関連の型定義

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

// APIレスポンス用の型
export interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
