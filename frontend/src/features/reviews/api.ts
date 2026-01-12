// レビュー関連のAPI

import { ApiReview } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const reviewApi = {
  // 商品のレビュー一覧を取得
  async getProductReviews(productId: number): Promise<ApiReview[]> {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  },

  // レビューを投稿（認証必要）
  async createReview(
    productId: number,
    data: { rating: number; comment: string },
    token: string
  ): Promise<ApiReview> {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }
    return response.json();
  },

  // レビューを更新（認証必要）
  async updateReview(
    reviewId: number,
    data: { rating: number; comment: string },
    token: string
  ): Promise<ApiReview> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update review');
    }
    return response.json();
  },

  // レビューを削除（認証必要）
  async deleteReview(reviewId: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
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
