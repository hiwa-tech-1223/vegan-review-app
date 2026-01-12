import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Admin } from '../../auth/types';
import { Product } from '../../products/types';
import { AdminHeader } from './AdminHeader';
import { mockProducts } from '../../../data/mockData';
import { ADMIN_CATEGORIES } from '../types';

interface AdminProductFormProps {
  admin: Admin;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

// かんたんリンクHTMLからURLを抽出する関数
function parseKantanLinkHtml(html: string): {
  imageUrl?: string;
  amazonUrl?: string;
  rakutenUrl?: string;
  yahooUrl?: string;
} {
  const result: {
    imageUrl?: string;
    amazonUrl?: string;
    rakutenUrl?: string;
    yahooUrl?: string;
  } = {};

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 画像URLを抽出
    const img = doc.querySelector('img');
    if (img) {
      const src = img.getAttribute('src');
      if (src) {
        result.imageUrl = src;
      }
    }

    // アフィリエイトリンクを抽出
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent || '';

      // Amazon判定
      if (href.includes('amazon') || href.includes('amzn') || text.includes('Amazon')) {
        result.amazonUrl = href;
      }
      // 楽天判定
      else if (href.includes('rakuten') || text.includes('楽天')) {
        result.rakutenUrl = href;
      }
      // Yahoo判定
      else if (href.includes('yahoo') || text.includes('Yahoo')) {
        result.yahooUrl = href;
      }
    });
  } catch (e) {
    console.error('Failed to parse HTML:', e);
  }

  return result;
}

export function AdminProductForm({ admin, products, setProducts }: AdminProductFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const allProducts = products.length > 0 ? products : mockProducts;
  const existingProduct = id ? allProducts.find(p => p.id === Number(id)) : null;

  const [formData, setFormData] = useState({
    nameJa: '',
    name: '',
    category: 'Meat Alternatives',
    categoryJa: '代替肉',
    descriptionJa: '',
    description: '',
    image: '',
    amazonUrl: '',
    rakutenUrl: '',
    yahooUrl: ''
  });

  const [kantanLinkHtml, setKantanLinkHtml] = useState('');
  const [extractMessage, setExtractMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        nameJa: existingProduct.nameJa,
        name: existingProduct.name,
        category: existingProduct.category,
        categoryJa: existingProduct.categoryJa,
        descriptionJa: existingProduct.descriptionJa,
        description: existingProduct.description,
        image: existingProduct.image,
        amazonUrl: '',
        rakutenUrl: '',
        yahooUrl: ''
      });
    }
  }, [existingProduct]);

  const handleCategoryChange = (categoryEn: string) => {
    const category = ADMIN_CATEGORIES.find(c => c.en === categoryEn);
    if (category) {
      setFormData({
        ...formData,
        category: category.en,
        categoryJa: category.ja
      });
    }
  };

  // かんたんリンクHTMLからURLを抽出
  const handleExtractUrls = () => {
    if (!kantanLinkHtml.trim()) {
      setExtractMessage({ type: 'error', text: 'HTMLを入力してください' });
      return;
    }

    const extracted = parseKantanLinkHtml(kantanLinkHtml);

    const updates: Partial<typeof formData> = {};
    let extractedCount = 0;

    if (extracted.imageUrl) {
      updates.image = extracted.imageUrl;
      extractedCount++;
    }
    if (extracted.amazonUrl) {
      updates.amazonUrl = extracted.amazonUrl;
      extractedCount++;
    }
    if (extracted.rakutenUrl) {
      updates.rakutenUrl = extracted.rakutenUrl;
      extractedCount++;
    }
    if (extracted.yahooUrl) {
      updates.yahooUrl = extracted.yahooUrl;
      extractedCount++;
    }

    if (extractedCount > 0) {
      setFormData({ ...formData, ...updates });
      setExtractMessage({
        type: 'success',
        text: `${extractedCount}件のURLを抽出しました`
      });
    } else {
      setExtractMessage({
        type: 'error',
        text: 'URLを抽出できませんでした。HTMLを確認してください'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && existingProduct) {
      // Update existing product
      const updatedProducts = allProducts.map(p =>
        p.id === Number(id)
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
        id: Date.now(),
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報セクション */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">基本情報 / Basic Information</h2>
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
                  {ADMIN_CATEGORIES.map(category => (
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
            </div>
          </div>

          {/* もしもアフィリエイト連携セクション */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              📋 もしもアフィリエイト連携
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              「かんたんリンク」のHTMLを貼り付けると、画像URLとアフィリエイトリンクを自動抽出します
            </p>

            {/* かんたんリンクHTML入力 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                かんたんリンク HTML
              </label>
              <textarea
                value={kantanLinkHtml}
                onChange={(e) => setKantanLinkHtml(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59] font-mono text-sm"
                rows={5}
                placeholder='<div class="easyLink-box">...</div>'
              />
            </div>

            <button
              type="button"
              onClick={handleExtractUrls}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all mb-4"
            >
              🔍 URLを自動抽出
            </button>

            {extractMessage && (
              <div className={`p-3 rounded-lg mb-4 ${
                extractMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {extractMessage.text}
              </div>
            )}

            {/* 使い方ガイド */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">💡 使い方</p>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>もしもアフィリエイトで「かんたんリンク」を作成</li>
                <li>「HTMLソースを1行にする」にチェック</li>
                <li>HTMLコードをコピーして上に貼り付け</li>
                <li>「URLを自動抽出」をクリック</li>
              </ol>
            </div>

            <hr className="my-6" />

            {/* 画像URL */}
            <div className="mb-6">
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

            {/* アフィリエイトリンク */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">アフィリエイトリンク</h3>

              {/* Amazon */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <span className="inline-block w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FF9900' }}></span>
                  Amazon URL
                </label>
                <input
                  type="url"
                  value={formData.amazonUrl}
                  onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                  placeholder="https://af.moshimo.com/..."
                />
              </div>

              {/* 楽天 */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <span className="inline-block w-4 h-4 rounded mr-2" style={{ backgroundColor: '#BF0000' }}></span>
                  楽天市場 URL
                </label>
                <input
                  type="url"
                  value={formData.rakutenUrl}
                  onChange={(e) => setFormData({ ...formData, rakutenUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                  placeholder="https://af.moshimo.com/..."
                />
              </div>

              {/* Yahoo */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <span className="inline-block w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FF0033' }}></span>
                  Yahoo!ショッピング URL
                </label>
                <input
                  type="url"
                  value={formData.yahooUrl}
                  onChange={(e) => setFormData({ ...formData, yahooUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A7C59]"
                  placeholder="https://af.moshimo.com/..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
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
