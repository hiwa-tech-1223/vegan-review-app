import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Admin } from '../../auth/types';
import { Product } from '../../products/types';
import { mockProducts } from '../../../data/mockData';
import { AdminHeader } from './AdminHeader';

interface AdminProductManagementProps {
  admin: Admin;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const categories = [
  'All',
  'Meat Alternatives',
  'Dairy',
  'Snacks',
  'Beverages',
  'Seasonings'
];

export function AdminProductManagement({ admin, products, setProducts }: AdminProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize with mock products if empty
  useEffect(() => {
    if (products.length === 0) {
      setProducts(mockProducts);
    }
  }, [products.length, setProducts]);

  const allProducts = products.length > 0 ? products : mockProducts;

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameJa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteProduct = (id: string) => {
    if (confirm('この商品を削除しますか？\n\nAre you sure you want to delete this product?')) {
      setProducts(allProducts.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(displayedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    if (confirm(`${selectedProducts.length}件の商品を削除しますか？\n\nAre you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      setProducts(allProducts.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    }
  };

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
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                <Trash2 className="w-4 h-4" />
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
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
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
              {displayedProducts.map(product => (
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
                        src={product.image}
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
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {product.category}
                    </span>
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
                        to={`/admin/products/edit/${product.id}`}
                        className="p-2 text-gray-600 hover:text-[#4A7C59] hover:bg-gray-100 rounded transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
