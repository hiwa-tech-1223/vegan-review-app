import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Admin, Product } from '../../App';
import { AdminHeader } from './AdminHeader';
import { mockProducts } from '../../data/mockData';

interface AdminProductFormProps {
  admin: Admin;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const categories = [
  { en: 'Meat Alternatives', ja: '代替肉' },
  { en: 'Dairy', ja: '乳製品代替' },
  { en: 'Snacks', ja: 'スナック' },
  { en: 'Beverages', ja: '飲料' },
  { en: 'Seasonings', ja: '調味料' }
];

export function AdminProductForm({ admin, products, setProducts }: AdminProductFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const allProducts = products.length > 0 ? products : mockProducts;
  const existingProduct = id ? allProducts.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    nameJa: '',
    name: '',
    category: 'Meat Alternatives',
    categoryJa: '代替肉',
    descriptionJa: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        nameJa: existingProduct.nameJa,
        name: existingProduct.name,
        category: existingProduct.category,
        categoryJa: existingProduct.categoryJa,
        descriptionJa: existingProduct.descriptionJa,
        description: existingProduct.description,
        image: existingProduct.image
      });
    }
  }, [existingProduct]);

  const handleCategoryChange = (categoryEn: string) => {
    const category = categories.find(c => c.en === categoryEn);
    if (category) {
      setFormData({
        ...formData,
        category: category.en,
        categoryJa: category.ja
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && existingProduct) {
      // Update existing product
      const updatedProducts = allProducts.map(p =>
        p.id === id
          ? {
              ...p,
              ...formData
            }
          : p
      );
      setProducts(updatedProducts);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `${Date.now()}`,
        ...formData,
        rating: 0,
        reviewCount: 0
      };
      setProducts([...allProducts, newProduct]);
    }

    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminHeader admin={admin} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl text-gray-900 mb-6">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Product Name (JA) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Product Name (Japanese) / 製品名（日本語）
              </label>
              <input
                type="text"
                required
                value={formData.nameJa}
                onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                placeholder="ビヨンドバーガー"
              />
            </div>

            {/* Product Name (EN) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Product Name (English) / 製品名（英語）
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                placeholder="Beyond Burger"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Category / カテゴリー
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
              >
                {categories.map(category => (
                  <option key={category.en} value={category.en}>
                    {category.en} / {category.ja}
                  </option>
                ))}
              </select>
            </div>

            {/* Description (JA) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Description (Japanese) / 説明（日本語）
              </label>
              <textarea
                required
                value={formData.descriptionJa}
                onChange={(e) => setFormData({ ...formData, descriptionJa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                rows={4}
                placeholder="製品の説明を日本語で入力してください..."
              />
            </div>

            {/* Description (EN) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Description (English) / 説明（英語）
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                rows={4}
                placeholder="Enter product description in English..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Image URL / 画像URL
              </label>
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Preview"
                    className="w-48 h-36 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6849] transition-all"
            >
              {isEditMode ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
