import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Admin } from '../../../../api/auth/authTypes';
import { AdminHeader } from '../../common/AdminHeader/AdminHeader';
import { productApi } from '../../../../api/customer/productApi';
import { CategoryFormData } from '../../../../api/admin/categoryTypes';

interface AdminCategoryFormProps {
  admin: Admin;
}

export function AdminCategoryForm({ admin }: AdminCategoryFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameJa: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モードの場合、既存データを取得
  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        setIsLoading(true);
        try {
          const categories = await productApi.getCategories();
          const category = categories.find((c: { id: number }) => c.id === Number(id));
          if (category) {
            setFormData({
              name: category.name,
              nameJa: category.nameJa
            });
          } else {
            setError('Category not found');
          }
        } catch (err) {
          setError('Failed to fetch category');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!formData.name.trim()) {
      setError('English name is required');
      return;
    }
    if (!formData.nameJa.trim()) {
      setError('Japanese name is required');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API連携時に実装
      console.log('Saving category:', formData);

      // 仮の非同期処理（API呼び出しの代わり）
      await Promise.resolve();

      navigate('/admin/categories');
    } catch (err) {
      setError('Failed to save category');
      console.error(err);
    } finally {
      setIsSaving(false);
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl text-gray-900 mb-6">
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">カテゴリー情報 / Category Information</h2>

            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Name (EN) */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Category Name (English) / カテゴリー名（英語）
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                  placeholder="Meat Alternatives"
                />
              </div>

              {/* Name (JA) */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Category Name (Japanese) / カテゴリー名（日本語）
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameJa}
                  onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                  placeholder="代替肉"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
