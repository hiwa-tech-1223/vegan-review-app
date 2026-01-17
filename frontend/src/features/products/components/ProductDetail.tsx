import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Heart, Leaf, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth';
import { productApi } from '../api';
import { ApiProduct } from '../types';
import { reviewApi, ApiReview } from '../../reviews';
import { userApi } from '../../users';
import { StarRating } from '../../../components/StarRating';

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

  // 編集モード（既存レビューがある場合）
  const [existingUserReview, setExistingUserReview] = useState<ApiReview | null>(null);
  const isEditMode = existingUserReview !== null;

  // 商品詳細を取得
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoadingProduct(true);
      setProductError(null);
      try {
        const data = await productApi.getProduct(Number(id));
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
  const userId = user?.id;
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setIsLoadingReviews(true);
      try {
        const data = await reviewApi.getProductReviews(Number(id));
        setReviews(data ?? []);

        // ログインユーザーの既存レビューをチェック
        if (userId) {
          const userReview = data?.find(r => r.userId === userId);
          if (userReview) {
            setExistingUserReview(userReview);
            setRating(userReview.rating);
            setComment(userReview.comment);
          } else {
            setExistingUserReview(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id, userId]);

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !token || !id) return;
      try {
        const favorites = await userApi.getFavorites(user.id, token);
        const isFav = favorites?.some((f: { productId: number }) => f.productId === Number(id)) ?? false;
        setIsFavorite(isFav);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };
    fetchFavorites();
  }, [user, token, id]);

  // レビューのバリデーション
  const validateReview = (): string | null => {
    const trimmedComment = comment.trim();

    if (rating < 1 || rating > 5) {
      return 'Rating must be between 1 and 5 / 評価は1〜5の間で選択してください';
    }
    if (!trimmedComment) {
      return 'Comment is required / コメントを入力してください';
    }
    if (trimmedComment.length < 10) {
      return `Comment must be at least 10 characters (currently ${trimmedComment.length}) / コメントは10文字以上必要です（現在${trimmedComment.length}文字）`;
    }
    if (trimmedComment.length > 1000) {
      return `Comment must be at most 1000 characters (currently ${trimmedComment.length}) / コメントは1000文字以内にしてください（現在${trimmedComment.length}文字）`;
    }
    return null;
  };

  // レビュー投稿/更新
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      navigate('/login');
      return;
    }
    if (!id) return;

    // フロントエンドバリデーション
    const validationError = validateReview();
    if (validationError) {
      setReviewError(validationError);
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      let updatedReview: ApiReview;

      if (isEditMode && existingUserReview) {
        // 更新モード
        updatedReview = await reviewApi.updateReview(
          existingUserReview.id,
          { rating, comment },
          token
        );
        // 既存レビューを更新
        setReviews(prev => prev.map(r =>
          r.id === updatedReview.id ? updatedReview : r
        ));
        setExistingUserReview(updatedReview);
      } else {
        // 新規作成モード
        updatedReview = await reviewApi.createReview(Number(id), { rating, comment }, token);
        setReviews(prev => [updatedReview, ...prev]);
        setExistingUserReview(updatedReview);
      }

      // 商品の評価を再取得して更新
      const updatedProduct = await productApi.getProduct(Number(id));
      setProduct(updatedProduct);
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
        await userApi.removeFavorite(user.id, Number(id), token);
        setIsFavorite(false);
      } else {
        await userApi.addFavorite(user.id, Number(id), token);
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
          <div className="grid md:grid-cols-2 gap-8 p-8 pb-4 items-start">
            <div className="md:sticky md:top-8">
              <img
                src={product.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                alt={product.name}
                className="w-full object-cover rounded-xl"
                style={{ aspectRatio: '4/3' }}
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
                <StarRating rating={product.rating} showValue size="lg" />
                <span style={{ color: 'var(--text)' }}>
                  ({product.reviewCount} reviews / レビュー)
                </span>
              </div>
              <button
                onClick={toggleFavorite}
                disabled={isTogglingFavorite}
                className="flex items-center gap-2 px-6 py-3 rounded-full mb-4 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: isFavorite ? 'var(--accent)' : 'var(--background)',
                  color: isFavorite ? 'white' : 'var(--primary)'
                }}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'white' : 'none'} />
                {isFavorite ? 'Added to Favorites / お気に入り済み' : 'Add to Favorites / お気に入りに追加'}
              </button>
              {/* 購入ボタン（各ストア） */}
              {(product.amazonUrl || product.rakutenUrl || product.yahooUrl) && (
                <div className="mt-4">
                  <p className="text-sm mb-2" style={{ color: '#666' }}>
                    購入する / Buy Now
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {product.amazonUrl && (
                      <a
                        href={product.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="transition-all hover:opacity-90 hover:shadow-md"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#FF9900',
                          color: '#FFFFFF',
                          textDecoration: 'none'
                        }}
                      >
                        Amazon
                      </a>
                    )}
                    {product.rakutenUrl && (
                      <a
                        href={product.rakutenUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="transition-all hover:opacity-90 hover:shadow-md"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#BF0000',
                          color: '#FFFFFF',
                          textDecoration: 'none'
                        }}
                      >
                        楽天市場
                      </a>
                    )}
                    {product.yahooUrl && (
                      <a
                        href={product.yahooUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="transition-all hover:opacity-90 hover:shadow-md"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#FF0033',
                          color: '#FFFFFF',
                          textDecoration: 'none'
                        }}
                      >
                        Yahoo!
                      </a>
                    )}
                  </div>
                </div>
              )}
              {/* 後方互換: 既存のaffiliateUrlがある場合 */}
              {product.affiliateUrl && !product.amazonUrl && !product.rakutenUrl && !product.yahooUrl && (
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full mb-6 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                >
                  <ExternalLink className="w-5 h-5" />
                  Buy Now / 購入する
                </a>
              )}
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
            {isEditMode
              ? 'Edit Your Review / レビューを編集'
              : 'Write a Review / レビューを書く'
            }
          </h2>
          {isEditMode && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
              You have already reviewed this product. You can edit your review below.
              / この商品はすでにレビュー済みです。以下から編集できます。
            </div>
          )}
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
                minLength={10}
                maxLength={1000}
              />
              <p className={`text-sm mt-1 ${comment.trim().length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                {comment.trim().length} / 1000 {comment.trim().length < 10 && `(${10 - comment.trim().length} more needed / あと${10 - comment.trim().length}文字)`}
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview || comment.trim().length < 10}
              className="px-6 py-3 rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isSubmittingReview
                ? (isEditMode ? 'Updating... / 更新中...' : 'Submitting... / 投稿中...')
                : (isEditMode ? 'Update Review / レビューを更新' : 'Submit Review / レビューを投稿')
              }
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
                        <StarRating rating={review.rating} size="sm" />
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
          <div className="text-center mt-4 text-xs" style={{ color: '#999' }}>
            ※ 本サイトはアフィリエイトプログラムに参加しています
          </div>
          <div className="text-center mt-2 text-sm" style={{ color: '#666' }}>
            © 2025 VeganBite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
