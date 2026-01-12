// 管理者関連のAPI

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const adminApi = {
  // 商品を作成
  async createProduct(data: {
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
    categoryId: string;
    imageUrl: string;
    amazonUrl?: string;
    rakutenUrl?: string;
    yahooUrl?: string;
  }, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  // 商品を更新
  async updateProduct(id: string, data: {
    name?: string;
    nameJa?: string;
    description?: string;
    descriptionJa?: string;
    categoryId?: string;
    imageUrl?: string;
    amazonUrl?: string;
    rakutenUrl?: string;
    yahooUrl?: string;
  }, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  },

  // 商品を削除
  async deleteProduct(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  },

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
