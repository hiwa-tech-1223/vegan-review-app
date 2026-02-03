// レビュー管理関連のAPI

import { ApiReview } from '../customer/reviewTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const adminReviewApi = {
  // 全レビュー一覧取得
  async getAllReviews(token: string): Promise<ApiReview[]> {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  },

  // レビューを削除（管理者権限）
  async deleteReview(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
  },
};
