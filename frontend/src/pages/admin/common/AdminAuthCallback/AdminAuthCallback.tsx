import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../../auth';

export function AdminAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        let errorMessage = 'ログインに失敗しました';
        if (error === 'not_admin') {
          errorMessage = '管理者として登録されていません';
        }
        console.error('Admin login error:', error);
        navigate('/admin/login?error=' + encodeURIComponent(errorMessage));
        return;
      }

      if (token) {
        await login(token);
        navigate('/admin/products');
      } else {
        navigate('/admin/login?error=no_token');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">管理者ログイン中...</p>
      </div>
    </div>
  );
}
