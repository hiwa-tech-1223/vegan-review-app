import { Link, useSearchParams } from 'react-router';
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function UserLogin() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  // Already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Decorative leaf icons */}
      <div className="absolute top-10 left-10 opacity-5">
        <Leaf className="w-32 h-32" style={{ color: 'var(--primary)' }} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-5">
        <Leaf className="w-40 h-40" style={{ color: 'var(--primary)' }} />
      </div>
      <div className="absolute top-1/3 right-20 opacity-5">
        <Leaf className="w-24 h-24" style={{ color: 'var(--primary)' }} />
      </div>
      <div className="absolute bottom-1/4 left-20 opacity-5">
        <Leaf className="w-28 h-28" style={{ color: 'var(--primary)' }} />
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-10 h-10" style={{ color: 'var(--primary)' }} />
            <h1 className="text-3xl" style={{ color: 'var(--primary)' }}>VeganBite</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            ビーガン食品のリアルな口コミ
          </p>
        </div>

        <h2 className="text-2xl text-center mb-8" style={{ color: 'var(--text)' }}>
          Welcome
          <br />
          ようこそ
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            ログインに失敗しました。もう一度お試しください。
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-full px-6 py-3 hover:bg-gray-50 transition-all mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span style={{ color: 'var(--text)' }}>
            Continue with Google
          </span>
        </button>

        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:opacity-70">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>.
          <br />
          続けることで、
          <Link to="/terms" className="underline hover:opacity-70">利用規約</Link>
          と
          <Link to="/privacy" className="underline hover:opacity-70">プライバシーポリシー</Link>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
