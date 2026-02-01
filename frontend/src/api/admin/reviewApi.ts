// レビュー管理関連のAPI

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const adminApi = {
  // レビューを削除（管理者権限）
  async deleteReview(id: string, token: string) {
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
