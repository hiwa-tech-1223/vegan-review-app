// カスタマー管理関連のAPI

import { ManagedCustomer } from './customerTypes';

// TODO: API連携時に削除
const mockCustomers: ManagedCustomer[] = [
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
  // カスタマー一覧を取得
  async getCustomers(_token: string): Promise<ManagedCustomer[]> {
    // TODO: API連携時に実装
    return mockCustomers;
  },

  // カスタマーをBANする
  async banCustomer(customerId: number, reason: string, _token: string): Promise<ManagedCustomer> {
    // TODO: API連携時に実装
    const customer = mockCustomers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    return { ...customer, status: 'banned', statusReason: reason };
  },

  // カスタマーのBAN/停止を解除する
  async unbanCustomer(customerId: number, _token: string): Promise<ManagedCustomer> {
    // TODO: API連携時に実装
    const customer = mockCustomers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    return { ...customer, status: 'active', statusReason: undefined, suspendedUntil: undefined };
  },
};
