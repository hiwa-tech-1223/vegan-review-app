// 商品関連のAPI

import { ApiCategory, ApiProduct } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const productApi = {
  // カテゴリ一覧を取得
  async getCategories(): Promise<ApiCategory[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },

  // 商品一覧を取得
  async getProducts(params?: { category?: string; search?: string }): Promise<ApiProduct[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') {
      searchParams.append('category', params.category);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  // 商品詳細を取得
  async getProduct(id: string): Promise<ApiProduct> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },
};
