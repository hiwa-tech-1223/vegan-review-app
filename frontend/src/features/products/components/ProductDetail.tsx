import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Heart, Leaf, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth';
import { productApi } from '../api';
import { ApiProduct } from '../types';
import { reviewApi, ApiReview } from '../../reviews';
import { userApi } from '../../users';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // 商品データ
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // レビューデータ
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // お気に入り状態
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // レビューフォーム
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 商品詳細を取得
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoadingProduct(true);
      setProductError(null);
      try {
        const data = await productApi.getProduct(id);
        setProduct(data);
      } catch (err) {
        setProductError('商品の取得に失敗しました / Failed to fetch product');
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [id]);

  // レビュー一覧を取得
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setIsLoadingReviews(true);
      try {
        const data = await reviewApi.getProductReviews(id);
        setReviews(data ?? []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id]);

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !token || !id) return;
      try {
        const favorites = await userApi.getFavorites(user.id, token);
        const isFav = favorites?.some((f: { productId: string }) => f.productId === id) ?? false;
        setIsFavorite(isFav);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };
    fetchFavorites();
  }, [user, token, id]);

  // レビュー投稿
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      navigate('/login');
      return;
    }
    if (!comment.trim() || !id) return;

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const newReview = await reviewApi.createReview(id, { rating, comment }, token);
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setReviewError(message);
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // お気に入り切り替え
  const toggleFavorite = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    if (!id) return;

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await userApi.removeFavorite(user.id, id, token);
        setIsFavorite(false);
      } else {
        await userApi.addFavorite(user.id, id, token);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // ローディング中
  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  // エラー時
  if (productError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <p className="text-red-500 mb-4">{productError || 'Product not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
        >
          Back to Home / ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                Back / 戻る
              </button>
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                <span className="text-2xl" style={{ color: 'var(--primary)' }}>VeganBite</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <img
                src={product.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                alt={product.name}
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.categories && product.categories.length > 0 ? (
                  product.categories.map(cat => (
                    <span
                      key={cat.id}
                      className="inline-block px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: 'var(--background)', color: 'var(--primary)' }}
                    >
                      {cat.name} / {cat.nameJa}
                    </span>
                  ))
                ) : (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--primary)' }}
                  >
                    Uncategorized / 未分類
                  </span>
                )}
              </div>
              <h1 className="text-3xl mb-2" style={{ color: 'var(--text)' }}>
                {product.name}
              </h1>
              <p className="text-xl mb-4" style={{ color: 'var(--text)' }}>
                {product.nameJa}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="text-2xl"
                      style={{ color: i < Math.floor(product.rating) ? 'var(--accent)' : '#ddd' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ color: 'var(--text)' }}>
                  ({product.reviewCount} reviews / レビュー)
                </span>
              </div>
              <button
                onClick={toggleFavorite}
                disabled={isTogglingFavorite}
                className="flex items-center gap-2 px-6 py-3 rounded-full mb-6 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: isFavorite ? 'var(--accent)' : 'var(--background)',
                  color: isFavorite ? 'white' : 'var(--primary)'
                }}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'white' : 'none'} />
                {isFavorite ? 'Added to Favorites / お気に入り済み' : 'Add to Favorites / お気に入りに追加'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="px-8 pb-8">
            <h2 className="text-xl mb-3" style={{ color: 'var(--text)' }}>
              Description / 説明
            </h2>
            <p className="mb-2" style={{ color: 'var(--text)' }}>
              {product.description}
            </p>
            <p style={{ color: 'var(--text)' }}>
              {product.descriptionJa}
            </p>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl mb-4" style={{ color: 'var(--text)' }}>
            Write a Review / レビューを書く
          </h2>
          {reviewError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {reviewError}
            </div>
          )}
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block mb-2" style={{ color: 'var(--text)' }}>
                Rating / 評価
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl"
                    style={{ color: star <= rating ? 'var(--accent)' : '#ddd' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2" style={{ color: 'var(--text)' }}>
                Comment / コメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[var(--primary)]"
                rows={4}
                placeholder="Share your experience... / あなたの体験をシェア..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview || !comment.trim()}
              className="px-6 py-3 rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isSubmittingReview ? 'Submitting... / 投稿中...' : 'Submit Review / レビューを投稿'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl mb-6" style={{ color: 'var(--text)' }}>
            Reviews / レビュー ({reviews.length})
          </h2>
          {isLoadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text)' }}>
              No reviews yet / まだレビューがありません
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.user?.avatar || 'https://placehold.co/48x48?text=User'}
                      alt={review.user?.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p style={{ color: 'var(--text)' }}>{review.user?.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
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
                      </div>
                      <p style={{ color: 'var(--text)' }}>{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
