import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Leaf, LogOut, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../auth';
import { customerApi } from '../../../../api/customer/customerApi';
import { reviewApi } from '../../../../api/customer/reviewApi';
import { ApiFavorite } from '../../../../api/customer/customerTypes';
import { ApiReview } from '../../../../api/customer/reviewTypes';
import { StarRating } from '../../../../components/StarRating';
import { Footer } from '../../../../components/common/Footer';

export function MyPage() {
  const navigate = useNavigate();
  const { customer, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer || !token) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [favoritesData, reviewsData] = await Promise.all([
          customerApi.getFavorites(customer.id, token),
          customerApi.getReviews(customer.id, token),
        ]);
        setFavorites(favoritesData || []);
        setReviews(reviewsData || []);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customer, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!token) return;
    try {
      await reviewApi.deleteReview(reviewId, token);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      toast.error('レビューの削除に失敗しました');
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    if (!customer || !token) return;
    try {
      await customerApi.removeFavorite(customer.id, productId, token);
      setFavorites(favorites.filter(f => f.productId !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      toast.error('お気に入りの削除に失敗しました');
    }
  };

  if (!customer) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Retry / 再試行
          </button>
        </div>
      </div>
    );
  }

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
                src={customer.avatar}
                alt={customer.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span style={{ color: 'var(--text)' }}>{customer.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl mb-2" style={{ color: 'var(--text)' }}>
                {customer.name}
              </h1>
              <p className="text-gray-600 mb-4">{customer.email}</p>
              <div className="flex gap-8 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Member Since / 登録日</p>
                  <p style={{ color: 'var(--text)' }}>{customer.memberSince ? customer.memberSince.split('T')[0] : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviews / レビュー数</p>
                  <p style={{ color: 'var(--text)' }}>{reviews.length}</p>
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
                backgroundColor: activeTab === 'reviews' ? 'white' : 'var(--background)',
                color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text)'
              }}
            >
              My Reviews / 私のレビュー
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className="flex-1 px-6 py-4 transition-all"
              style={{
                backgroundColor: activeTab === 'favorites' ? 'white' : 'var(--background)',
                color: activeTab === 'favorites' ? 'var(--primary)' : 'var(--text)'
              }}
            >
              Favorites / お気に入り
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No reviews yet. / まだレビューがありません。
                  </p>
                ) : (
                  reviews.map(review => {
                    const product = review.product;
                    if (!product) return null;
                    return (
                      <div key={review.id} className="border rounded-xl p-4">
                        <div className="flex gap-4">
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="mb-1 hover:opacity-70" style={{ color: 'var(--text)' }}>
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">{product.nameJa}</p>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                            <p className="mb-3" style={{ color: 'var(--text)' }}>{review.comment}</p>
                            <div className="flex gap-2">
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
                {favorites.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 col-span-2">
                    No favorites yet. / まだお気に入りがありません。
                  </p>
                ) : (
                  favorites.map(favorite => {
                    const product = favorite.product;
                    if (!product) return null;
                    return (
                      <div key={favorite.id} className="border rounded-xl overflow-hidden relative">
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={product.imageUrl}
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
                            <StarRating rating={product.rating} showValue size="sm" />
                            <span className="text-sm" style={{ color: 'var(--text)' }}>
                              ({product.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer showAffiliateNotice />
    </div>
  );
}
