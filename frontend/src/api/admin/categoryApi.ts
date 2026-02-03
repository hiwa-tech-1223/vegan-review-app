// カテゴリ管理関連のAPI

import { CategoryFormData } from './categoryTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const categoryApi = {
  async createCategory(data: CategoryFormData, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    return response.json();
  },

  async updateCategory(id: number, data: CategoryFormData, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update category');
    }
    return response.json();
  },

  async deleteCategory(id: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
  },
};
