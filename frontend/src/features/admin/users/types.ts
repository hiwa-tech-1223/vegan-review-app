// ユーザー管理関連の型定義

import { User } from '../../auth/types';

// 管理画面で表示するユーザー情報（Userを拡張）
export interface ManagedUser extends User {
  reviewCount: number;
  status: 'active' | 'banned' | 'suspended';
  statusReason?: string;
  suspendedUntil?: string;
}
