// カスタマー管理関連の型定義

import { Customer } from '../../auth/types';

// 管理画面で表示するカスタマー情報（Customerを拡張）
export interface ManagedCustomer extends Customer {
  reviewCount: number;
  status: 'active' | 'banned' | 'suspended';
  statusReason?: string;
  suspendedUntil?: string;
}
