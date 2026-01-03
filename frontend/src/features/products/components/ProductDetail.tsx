import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Heart, Leaf } from 'lucide-react';
import { mockProducts, mockReviews } from '../../../data/mockData';
import { User } from '../../auth/types';
import { Review } from '../../reviews/types';

interface ProductDetailProps {
  user: User | null;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
}

export function ProductDetail({ user, reviews, setReviews, favorites, setFavorites }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = mockProducts.find(p => p.id === id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!product) {
    return <div>Product not found</div>;
  }

  const productReviews = [...mockReviews.filter(r => r.productId === id), ...reviews.filter(r => r.productId === id)];
  const isFavorite = favorites.includes(product.id);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (comment.trim()) {
      const newReview: Review = {
        id: `r${Date.now()}`,
        productId: product.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      setReviews([...reviews, newReview]);
      setComment('');
      setRating(5);
    }
  };

  const toggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== product.id));
    } else {
      setFavorites([...favorites, product.id]);
    }
  };

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
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-sm mb-4"
                style={{ backgroundColor: 'var(--background)', color: 'var(--primary)' }}
              >
                {product.category} / {product.categoryJa}
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
                  ({productReviews.length} reviews / レビュー)
                </span>
              </div>
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-2 px-6 py-3 rounded-full mb-6 transition-all"
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
              className="px-6 py-3 rounded-full text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Submit Review / レビューを投稿
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl mb-6" style={{ color: 'var(--text)' }}>
            Reviews / レビュー ({productReviews.length})
          </h2>
          <div className="space-y-6">
            {productReviews.map(review => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p style={{ color: 'var(--text)' }}>{review.userName}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
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
        </div>
      </main>
    </div>
  );
}
