import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Leaf, User, Loader2 } from 'lucide-react';
import { productApi } from '../api';
import { ApiProduct, ApiCategory } from '../types';
import { User as UserType } from '../../auth/types';

interface ProductListingProps {
  user: UserType | null;
}

export function ProductListing({ user }: ProductListingProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 6;

  // 初回データ取得フラグ
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 初回ロード: カテゴリと商品を並列で取得
  // Promise.allで両方のAPIを同時に呼び出し、両方完了してからローディング終了
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [categoriesData, productsData] = await Promise.all([
          productApi.getCategories(),
          productApi.getProducts(),
        ]);
        setCategories(categoriesData ?? []);
        setProducts(productsData ?? []);
      } catch (err) {
        setError('データの取得に失敗しました / Failed to fetch data');
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchInitialData();
  }, []);

  // フィルター変更時: 商品のみ再取得（カテゴリは変わらないので取得不要）
  // 依存配列[selectedCategory, searchQuery] → これらの値が変わるたびに再実行
  useEffect(() => {
    // 初回ロードは上のuseEffectで処理するのでスキップ
    if (isInitialLoad) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getProducts({
          category: selectedCategory,
          search: searchQuery,
        });
        setProducts(data ?? []);
      } catch (err) {
        setError('商品の取得に失敗しました / Failed to fetch products');
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // デバウンス処理:
    // - 検索入力の場合: 300ms待ってからAPI呼び出し（連続入力による過剰なAPI呼び出しを防ぐ）
    // - カテゴリ変更の場合: 即時実行（0ms）
    const debounceTimer = setTimeout(fetchProducts, searchQuery ? 300 : 0);

    // クリーンアップ関数: 次のuseEffect実行前に前のタイマーをキャンセル
    // これにより、入力中は前の呼び出しがキャンセルされ、最後の入力後300msで1回だけAPI呼び出し
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery, isInitialLoad]);

  // ページネーション計算
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Top row: Logo and Navigation */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                <span className="text-2xl" style={{ color: 'var(--primary)' }}>VeganBite</span>
              </Link>

              <nav className="flex items-center gap-3 sm:gap-6">
                <Link to="/" className="hover:opacity-70 text-sm sm:text-base" style={{ color: 'var(--text)' }}>
                  <span className="hidden sm:inline">Home / ホーム</span>
                  <span className="sm:hidden">Home</span>
                </Link>
                {user ? (
                  <Link
                    to="/mypage"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">My Page</span>
                    <span className="sm:hidden">My</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    <span className="hidden sm:inline">Login / ログイン</span>
                    <span className="sm:hidden">Login</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Bottom row: Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products... / 製品を検索..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[var(--primary)]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4">
            {/* All Category */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="whitespace-nowrap px-4 py-2 rounded-full transition-all"
              style={{
                backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : 'transparent',
                color: selectedCategory === 'all' ? 'white' : 'var(--text)'
              }}
            >
              All / すべて
            </button>
            {/* Dynamic Categories */}
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.slug);
                  setCurrentPage(1);
                }}
                className="whitespace-nowrap px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor: selectedCategory === category.slug ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === category.slug ? 'white' : 'var(--text)'
                }}
              >
                {category.name} / {category.nameJa}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              Retry / 再試行
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text)' }}>
              No products found / 商品が見つかりません
            </p>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex flex-wrap gap-1 mb-2">
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
                <h3 className="mb-1" style={{ color: 'var(--text)' }}>
                  {product.name}
                </h3>
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
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10 h-10 rounded-full"
                style={{
                  backgroundColor: currentPage === i + 1 ? 'var(--primary)' : 'white',
                  color: currentPage === i + 1 ? 'white' : 'var(--text)'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
          </>
        )}
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
