import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Leaf, User } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { User as UserType } from '../App';

interface ProductListingProps {
  user: UserType | null;
}

const categories = [
  { en: 'All', ja: 'すべて' },
  { en: 'Meat Alternatives', ja: '代替肉' },
  { en: 'Dairy', ja: '乳製品代替' },
  { en: 'Snacks', ja: 'スナック' },
  { en: 'Beverages', ja: '飲料' },
  { en: 'Seasonings', ja: '調味料' }
];

export function ProductListing({ user }: ProductListingProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameJa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

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
            {categories.map(category => (
              <button
                key={category.en}
                onClick={() => {
                  setSelectedCategory(category.en);
                  setCurrentPage(1);
                }}
                className="whitespace-nowrap px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor: selectedCategory === category.en ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === category.en ? 'white' : 'var(--text)'
                }}
              >
                {category.en} / {category.ja}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div 
                  className="inline-block px-3 py-1 rounded-full text-sm mb-2"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--primary)' }}
                >
                  {product.category} / {product.categoryJa}
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