// 管理者関連のAPI

import { ManagedUser } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// TODO: API連携時に削除
const mockUsers: ManagedUser[] = [
  {
    id: 1,
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    memberSince: '2024-06-15',
    reviewCount: 5,
    status: 'active'
  },
  {
    id: 2,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    memberSince: '2024-08-20',
    reviewCount: 3,
    status: 'active'
  },
  {
    id: 3,
    name: 'Sakura Yamamoto',
    email: 'sakura@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    memberSince: '2024-10-01',
    reviewCount: 8,
    status: 'active'
  }
];

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

  // ユーザー一覧を取得
  async getUsers(_token: string): Promise<ManagedUser[]> {
    // TODO: API連携時に実装
    // const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // if (!response.ok) throw new Error('Failed to fetch users');
    // return response.json();
    return mockUsers;
  },

  // ユーザーをBANする
  async banUser(userId: number, reason: string, _token: string): Promise<ManagedUser> {
    // TODO: API連携時に実装
    // const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/ban`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ reason }),
    // });
    // if (!response.ok) throw new Error('Failed to ban user');
    // return response.json();
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user, status: 'banned', statusReason: reason };
  },

  // ユーザーのBAN/停止を解除する
  async unbanUser(userId: number, _token: string): Promise<ManagedUser> {
    // TODO: API連携時に実装
    // const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/unban`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // if (!response.ok) throw new Error('Failed to unban user');
    // return response.json();
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user, status: 'active', statusReason: undefined, suspendedUntil: undefined };
  },
};
