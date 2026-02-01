// カスタマー管理関連のAPI

import { ManagedCustomer } from './customerTypes';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const STATUS_MAP: Record<number, ManagedCustomer['status']> = {
  0: 'active',
  1: 'banned',
  2: 'suspended',
};

function toManagedCustomer(data: Record<string, unknown>): ManagedCustomer {
  return {
    ...data,
    status: STATUS_MAP[data.status as number] ?? 'active',
  } as ManagedCustomer;
}

export const adminApi = {
  // カスタマー一覧を取得
  async getCustomers(token: string): Promise<ManagedCustomer[]> {
    const response = await fetch(`${API_BASE}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data: Record<string, unknown>[] = await response.json();
    return data.map(toManagedCustomer);
  },

  // カスタマーをBANする
  async banCustomer(customerId: number, reason: string, token: string): Promise<ManagedCustomer> {
    const response = await fetch(`${API_BASE}/api/admin/customers/${customerId}/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to ban customer');
    return toManagedCustomer(await response.json());
  },

  // カスタマーを一時停止する
  async suspendCustomer(customerId: number, duration: number, reason: string, token: string): Promise<ManagedCustomer> {
    const response = await fetch(`${API_BASE}/api/admin/customers/${customerId}/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ duration, reason }),
    });
    if (!response.ok) throw new Error('Failed to suspend customer');
    return toManagedCustomer(await response.json());
  },

  // カスタマーのBAN/停止を解除する
  async unbanCustomer(customerId: number, token: string): Promise<ManagedCustomer> {
    const response = await fetch(`${API_BASE}/api/admin/customers/${customerId}/unban`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to unban customer');
    return toManagedCustomer(await response.json());
  },
};
