import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Admin } from '../../../../api/auth/authTypes';
import { useAuth } from '../../../auth';
import { ApiProduct, ApiCategory } from '../../../../api/customer/productTypes';
import { productApi } from '../../../../api/customer/productApi';
import { adminApi } from '../../../../api/admin/productApi';
import { AdminHeader } from '../../common/AdminHeader/AdminHeader';

interface AdminProductManagementProps {
  admin: Admin;
}

export function AdminProductManagement({ admin }: AdminProductManagementProps) {
  const { token } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productApi.getProducts(),
          productApi.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // フィルタリング
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === null ||
      product.categories.some(c => c.id === selectedCategoryId);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameJa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // 選択系
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(displayedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // 単一削除
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('この商品を削除しますか？\n\nAre you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await adminApi.deleteProduct(String(id), token!);
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } catch (err) {
      alert('削除に失敗しました');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`${selectedProducts.length}件の商品を削除しますか？\n\nAre you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await Promise.all(
        selectedProducts.map(id => adminApi.deleteProduct(String(id), token!))
      );
      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    } catch (err) {
      alert('一部の削除に失敗しました');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ローディング表示
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

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminHeader admin={admin} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-900">Product Management</h1>
          <div className="flex items-center gap-3">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Selected ({selectedProducts.length})
              </button>
            )}
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={selectedCategoryId ?? ''}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} / {category.nameJa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={displayedProducts.length > 0 && selectedProducts.length === displayedProducts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    商品がありません
                  </td>
                </tr>
              ) : (
                displayedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.nameJa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.categories.length > 0 ? (
                        <span className="text-sm text-gray-700">
                          {product.categories.map(cat => cat.name).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900">{product.rating.toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{product.reviewCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-600 hover:text-[#4A7C59] hover:bg-gray-100 rounded transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10 h-10 rounded-lg transition-all"
                style={{
                  backgroundColor: currentPage === i + 1 ? '#4A7C59' : 'white',
                  color: currentPage === i + 1 ? 'white' : '#333333',
                  border: currentPage === i + 1 ? 'none' : '1px solid #E5E7EB'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
