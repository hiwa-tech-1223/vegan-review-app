// ユーザー関連のAPI

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const userApi = {
  // ユーザーのお気に入り一覧を取得
  async getFavorites(userId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    return response.json();
  },

  // お気に入りに追加
  async addFavorite(userId: number, productId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add favorite');
    }
    return response.json();
  },

  // お気に入りから削除
  async removeFavorite(userId: number, productId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }
  },

  // ユーザーのレビュー一覧を取得
  async getReviews(userId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  },
};
