import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Ban, CheckCircle, Loader2, Clock } from 'lucide-react';
import { Admin } from '../../auth/types';
import { AdminHeader } from './AdminHeader';
import { adminApi } from '../api';
import { ManagedUser } from '../types';
import { useAuth } from '../../auth';

interface AdminUserManagementProps {
  admin: Admin;
}

export function AdminUserManagement({ admin }: AdminUserManagementProps) {
  const { token: adminToken } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned' | 'suspended'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getUsers(adminToken || '');
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [adminToken]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBanUser = (user: ManagedUser) => {
    setSelectedUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const confirmBan = async () => {
    if (!selectedUser || !adminToken) return;
    try {
      const updatedUser = await adminApi.banUser(selectedUser.id, banReason, adminToken);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason('');
    } catch (err) {
      console.error('Failed to ban user:', err);
    }
  };

  const handleUnbanUser = async (userId: number) => {
    if (!adminToken) return;
    if (confirm('このユーザーのBAN/停止を解除しますか？\n\nAre you sure you want to unban/unsuspend this user?')) {
      try {
        const updatedUser = await adminApi.unbanUser(userId, adminToken);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      } catch (err) {
        console.error('Failed to unban user:', err);
      }
    }
  };

  const handleSuspendUser = (user: ManagedUser) => {
    setSelectedUser(user);
    setSuspendDuration(7);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const confirmSuspend = async () => {
    if (!selectedUser || !adminToken) return;
    try {
      // TODO: API連携時に実装（suspendUser APIを追加）
      const updatedUser: ManagedUser = {
        ...selectedUser,
        status: 'suspended',
        statusReason: `${suspendDuration}日間停止: ${suspendReason}`
      };
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspendReason('');
    } catch (err) {
      console.error('Failed to suspend user:', err);
    }
  };

  const getStatusBadge = (status: ManagedUser['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>;
      case 'banned':
        return <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Banned</span>;
      case 'suspended':
        return <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Suspended</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminHeader admin={admin} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminHeader admin={admin} />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-900">User Management</h1>
          <div className="text-sm text-gray-500">
            Total: {users.length} users
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.memberSince ? new Date(user.memberSince).toLocaleDateString('ja-JP') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.reviewCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                      {user.statusReason && (
                        <p className="text-xs text-gray-500 mt-1">{user.statusReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.status === 'active' ? (
                          <>
                            <button
                              onClick={() => handleSuspendUser(user)}
                              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-all"
                              title="一時停止 / Suspend User"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBanUser(user)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              title="BAN / Ban User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                            title="解除 / Unban User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Ban Modal */}
      {showBanModal && selectedUser && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" style={{ margin: '16px' }}>
            <h2 className="text-xl text-gray-900 mb-4">BAN / Ban User</h2>
            <p className="text-gray-600 mb-4">
              <strong>{selectedUser.name}</strong> をBANしますか？
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                理由 / Reason
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                rows={3}
                placeholder="BAN理由を入力してください..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                キャンセル / Cancel
              </button>
              <button
                onClick={confirmBan}
                className="px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                BAN
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" style={{ margin: '16px' }}>
            <h2 className="text-xl text-gray-900 mb-4">一時停止 / Suspend User</h2>
            <p className="text-gray-600 mb-4">
              <strong>{selectedUser.name}</strong> を一時停止しますか？
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                停止期間 / Duration
              </label>
              <select
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
              >
                <option value={1}>1日 / 1 day</option>
                <option value={3}>3日 / 3 days</option>
                <option value={7}>7日 / 7 days</option>
                <option value={14}>14日 / 14 days</option>
                <option value={30}>30日 / 30 days</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                理由 / Reason
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                rows={3}
                placeholder="停止理由を入力してください..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                キャンセル / Cancel
              </button>
              <button
                onClick={confirmSuspend}
                className="px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: '#ca8a04', color: 'white' }}
              >
                一時停止 / Suspend
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
