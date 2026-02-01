// 商品管理関連のAPI

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const adminApi = {
  // 商品を作成
  async createProduct(data: {
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
    categoryIds: number[];
    imageUrl: string;
    amazonUrl?: string;
    rakutenUrl?: string;
    yahooUrl?: string;
  }, token: string) {
    // バックエンドは categories: [{id: ...}, ...] の形式を期待
    const payload = {
      ...data,
      categories: data.categoryIds.map(id => ({ id })),
    };
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
    categoryIds?: number[];
    imageUrl?: string;
    amazonUrl?: string;
    rakutenUrl?: string;
    yahooUrl?: string;
  }, token: string) {
    // バックエンドは categories: [{id: ...}, ...] の形式を期待
    const payload = {
      ...data,
      categories: data.categoryIds?.map(id => ({ id })),
    };
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
};
