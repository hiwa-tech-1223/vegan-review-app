import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Admin } from '../../auth/types';
import { AdminHeader } from './AdminHeader';
import { productApi } from '../../products/api';
import { Category } from '../../products/types';

interface AdminCategoryListProps {
  admin: Admin;
}

export function AdminCategoryList({ admin }: AdminCategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.nameJa.includes(searchQuery);
    return matchesSearch;
  });

  const handleDeleteCategory = (id: number) => {
    if (confirm('このカテゴリーを削除しますか？このカテゴリーの商品は未分類になります。\n\nAre you sure you want to delete this category? Products in this category will become uncategorized.')) {
      // TODO: API連携時に実装
      setCategories(categories.filter(c => c.id !== id));
      setSelectedCategories(selectedCategories.filter(cId => cId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return;
    if (confirm(`${selectedCategories.length}件のカテゴリーを削除しますか？これらのカテゴリーの商品は未分類になります。\n\nAre you sure you want to delete ${selectedCategories.length} category(ies)? Products in these categories will become uncategorized.`)) {
      setCategories(categories.filter(c => !selectedCategories.includes(c.id)));
      setSelectedCategories([]);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-900">Category Management</h1>
          <div className="flex items-center gap-3">
            {selectedCategories.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedCategories.length})
              </button>
            )}
            <Link
              to="/admin/categories/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              <Plus className="w-5 h-5" />
              Add Category
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={filteredCategories.length > 0 && selectedCategories.length === filteredCategories.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Name (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Name (JA)
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
                        className="w-4 h-4 text-[#4A7C59] rounded focus:ring-[#4A7C59]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">{category.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{category.nameJa}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/categories/${category.id}/edit`}
                          className="p-2 text-gray-600 hover:text-[#4A7C59] hover:bg-gray-100 rounded transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
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

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredCategories.length} categories
        </div>
      </main>
    </div>
  );
}
