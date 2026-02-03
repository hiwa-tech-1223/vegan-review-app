import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Admin } from '../../../../api/auth/authTypes';
import { AdminHeader } from '../../common/AdminHeader/AdminHeader';
import { productApi } from '../../../../api/customer/productApi';
import { categoryApi } from '../../../../api/admin/categoryApi';
import { CategoryFormData } from '../../../../api/admin/categoryTypes';
import { useAuth } from '../../../auth';

const CATEGORY_NAME_MAX_LENGTH = 100;

interface AdminCategoryFormProps {
  admin: Admin;
}

export function AdminCategoryForm({ admin }: AdminCategoryFormProps) {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameJa: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

  // --- ハンドラー ---

  // フィールド変更時にエラーをクリアしつつ値を更新
  const handleFieldChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // --- バリデーション ---

  // 単一フィールドのバリデーション（onBlur用）
  const validateField = useCallback((field: string): string | null => {
    switch (field) {
      case 'nameJa': {
        const v = formData.nameJa.trim();
        if (!v) return 'カテゴリー名（日本語）を入力してください';
        if (v.length > CATEGORY_NAME_MAX_LENGTH) return `${CATEGORY_NAME_MAX_LENGTH}文字以内にしてください（現在${v.length}文字）`;
        if (!/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(v)) return '日本語を1文字以上含めてください';
        return null;
      }
      case 'name': {
        const v = formData.name.trim();
        if (!v) return 'カテゴリー名（英語）を入力してください';
        if (v.length > CATEGORY_NAME_MAX_LENGTH) return `${CATEGORY_NAME_MAX_LENGTH}文字以内にしてください（現在${v.length}文字）`;
        if (!/[a-zA-Z]/.test(v)) return '英語を1文字以上含めてください';
        return null;
      }
      default:
        return null;
    }
  }, [formData]);

  // onBlur ハンドラー
  const handleBlur = (field: string) => {
    const error = validateField(field);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // 全フィールドのバリデーション（submit用）
  const validateCategory = (): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    const nameJa = formData.nameJa.trim();
    const name = formData.name.trim();

    if (!nameJa) {
      fieldErrors.nameJa = 'カテゴリー名（日本語）を入力してください';
    } else if (nameJa.length > CATEGORY_NAME_MAX_LENGTH) {
      fieldErrors.nameJa = `${CATEGORY_NAME_MAX_LENGTH}文字以内にしてください（現在${nameJa.length}文字）`;
    } else if (!/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(nameJa)) {
      fieldErrors.nameJa = '日本語を1文字以上含めてください';
    }

    if (!name) {
      fieldErrors.name = 'カテゴリー名（英語）を入力してください';
    } else if (name.length > CATEGORY_NAME_MAX_LENGTH) {
      fieldErrors.name = `${CATEGORY_NAME_MAX_LENGTH}文字以内にしてください（現在${name.length}文字）`;
    } else if (!/[a-zA-Z]/.test(name)) {
      fieldErrors.name = '英語を1文字以上含めてください';
    }

    return fieldErrors;
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    if (!token) {
      setError('認証エラー: 再ログインしてください');
      return;
    }

    const fieldErrors = validateCategory();
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(fieldErrors);
      // 最初のエラーフィールドまでスクロール
      const firstErrorField = Object.keys(fieldErrors)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await categoryApi.updateCategory(Number(id), formData, token);
      } else {
        await categoryApi.createCategory(formData, token);
      }

      navigate('/admin/categories');
    } catch (err) {
      setError(isEditMode ? '更新に失敗しました' : '作成に失敗しました');
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

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">カテゴリー情報 / Category Information</h2>

            <div className="space-y-6">
              {/* Name (JA) */}
              <div id="field-nameJa">
                <label className="block text-sm text-gray-700 mb-2">
                  Category Name (Japanese) / カテゴリー名（日本語）
                </label>
                <input
                  type="text"
                  value={formData.nameJa}
                  onChange={(e) => handleFieldChange('nameJa', e.target.value)}
                  onBlur={() => handleBlur('nameJa')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#4A7C59] ${validationErrors.nameJa ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="代替肉"
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.nameJa ? <p className="text-sm text-red-600">{validationErrors.nameJa}</p> : <span />}
                  <span className={`text-xs ${formData.nameJa.length > CATEGORY_NAME_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}`}>{formData.nameJa.length}/{CATEGORY_NAME_MAX_LENGTH}</span>
                </div>
              </div>

              {/* Name (EN) */}
              <div id="field-name">
                <label className="block text-sm text-gray-700 mb-2">
                  Category Name (English) / カテゴリー名（英語）
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#4A7C59] ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Meat Alternatives"
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.name ? <p className="text-sm text-red-600">{validationErrors.name}</p> : <span />}
                  <span className={`text-xs ${formData.name.length > CATEGORY_NAME_MAX_LENGTH ? 'text-red-600' : 'text-gray-400'}`}>{formData.name.length}/{CATEGORY_NAME_MAX_LENGTH}</span>
                </div>
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
