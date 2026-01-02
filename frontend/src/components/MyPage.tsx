import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Leaf, LogOut, Trash2, Edit2, X } from 'lucide-react';
import { Review } from '../App';
import { User } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';

interface MyPageProps {
  user: User;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
}

export function MyPage({ user, reviews, setReviews, favorites, setFavorites }: MyPageProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  const handleRemoveFavorite = (productId: string) => {
    setFavorites(favorites.filter(id => id !== productId));
  };

  const userReviews = reviews.filter(r => r.userId === user.id);
  const favoriteProducts = mockProducts.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <span className="text-2xl" style={{ color: 'var(--primary)' }}>VeganBite</span>
            </Link>
            <div className="flex items-center gap-4">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span style={{ color: 'var(--text)' }}>{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-6">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl mb-2" style={{ color: 'var(--text)' }}>
                {user.name}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex gap-8 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Member Since / 登録日</p>
                  <p style={{ color: 'var(--text)' }}>{user.memberSince}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviews / レビュー数</p>
                  <p style={{ color: 'var(--text)' }}>{userReviews.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Favorites / お気に入り数</p>
                  <p style={{ color: 'var(--text)' }}>{favorites.length}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <LogOut className="w-4 h-4" />
                Logout / ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('reviews')}
              className="flex-1 px-6 py-4 transition-all"
              style={{
                backgroundColor: activeTab === 'reviews' ? 'var(--background)' : 'white',
                color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text)'
              }}
            >
              My Reviews / 私のレビュー
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className="flex-1 px-6 py-4 transition-all"
              style={{
                backgroundColor: activeTab === 'favorites' ? 'var(--background)' : 'white',
                color: activeTab === 'favorites' ? 'var(--primary)' : 'var(--text)'
              }}
            >
              Favorites / お気に入り
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {userReviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No reviews yet. / まだレビューがありません。
                  </p>
                ) : (
                  userReviews.map(review => {
                    const product = mockProducts.find(p => p.id === review.productId);
                    if (!product) return null;
                    return (
                      <div key={review.id} className="border rounded-xl p-4">
                        <div className="flex gap-4">
                          <Link to={`/product/${product.id}`}>
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="mb-1 hover:opacity-70" style={{ color: 'var(--text)' }}>
                                {product.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span 
                                    key={i}
                                    style={{ color: i < review.rating ? 'var(--accent)' : '#ddd' }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="mb-3" style={{ color: 'var(--text)' }}>{review.comment}</p>
                            <div className="flex gap-2">
                              <button
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-50"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit / 編集
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete / 削除
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 col-span-2">
                    No favorites yet. / まだお気に入りがありません。
                  </p>
                ) : (
                  favoriteProducts.map(product => (
                    <div key={product.id} className="border rounded-xl overflow-hidden relative">
                      <Link to={`/product/${product.id}`}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="mb-1 hover:opacity-70" style={{ color: 'var(--text)' }}>
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>
                          {product.nameJa}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span 
                                key={i}
                                style={{ color: i < Math.floor(product.rating) ? 'var(--accent)' : '#ddd' }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text)' }}>
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)' }}>VeganBite</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Home / ホーム</Link>
              <Link to="/terms" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Terms / 利用規約</Link>
              <Link to="/privacy" className="hover:opacity-70" style={{ color: 'var(--text)' }}>Privacy / プライバシー</Link>
            </div>
          </div>
          <div className="text-center mt-4 text-sm" style={{ color: '#666' }}>
            © 2025 VeganBite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}