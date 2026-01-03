import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils';
import { ProductListing } from './ProductListing';
import { productApi } from '../api';
import { ApiProduct, ApiCategory } from '../types';

// productApi をモック
vi.mock('../api', () => ({
  productApi: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

// テスト用データ
const mockCategories: ApiCategory[] = [
  { id: 'cat-1', name: 'Meat Alternatives', nameJa: '代替肉', slug: 'meat-alternatives' },
  { id: 'cat-2', name: 'Dairy Alternatives', nameJa: '乳製品代替', slug: 'dairy-alternatives' },
  { id: 'cat-3', name: 'Snacks', nameJa: 'スナック', slug: 'snacks' },
];

const mockProducts: ApiProduct[] = [
  {
    id: 'prod-1',
    name: 'Beyond Burger',
    nameJa: 'ビヨンドバーガー',
    description: 'Plant-based burger',
    descriptionJa: '植物性バーガー',
    imageUrl: 'https://example.com/burger.jpg',
    categories: [mockCategories[0], mockCategories[2]], // 代替肉 + スナック
    price: 1000,
    stockQuantity: 10,
    isAvailable: true,
    rating: 4.5,
    reviewCount: 120,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Oat Milk',
    nameJa: 'オーツミルク',
    description: 'Creamy oat milk',
    descriptionJa: 'クリーミーなオーツミルク',
    imageUrl: 'https://example.com/oatmilk.jpg',
    categories: [mockCategories[1]],
    price: 500,
    stockQuantity: 50,
    isAvailable: true,
    rating: 4.2,
    reviewCount: 80,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Vegan Cheese',
    nameJa: 'ヴィーガンチーズ',
    description: 'Dairy-free cheese',
    descriptionJa: '乳製品不使用チーズ',
    imageUrl: 'https://example.com/cheese.jpg',
    categories: [mockCategories[1]],
    price: 800,
    stockQuantity: 30,
    isAvailable: true,
    rating: 3.8,
    reviewCount: 45,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

// 7件以上のモックデータ（ページネーションテスト用）
const mockManyProducts: ApiProduct[] = Array.from({ length: 8 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: `Product ${i + 1}`,
  nameJa: `商品 ${i + 1}`,
  description: `Description ${i + 1}`,
  descriptionJa: `説明 ${i + 1}`,
  imageUrl: `https://example.com/product${i + 1}.jpg`,
  categories: [mockCategories[0]],
  price: 1000 + i * 100,
  stockQuantity: 10,
  isAvailable: true,
  rating: 4.0,
  reviewCount: 10 + i,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}));

describe('ProductListing', () => {
  const mockUser = null; // 未ログイン状態

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモック設定
    vi.mocked(productApi.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(productApi.getProducts).mockResolvedValue(mockProducts);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期表示', () => {
    it('ローディング中はスピナーを表示する', async () => {
      // APIを遅延させる（resolveを保留）
      let resolveProducts: (value: ApiProduct[]) => void;
      vi.mocked(productApi.getProducts).mockImplementation(
        () => new Promise((resolve) => { resolveProducts = resolve; })
      );

      render(<ProductListing user={mockUser} />);

      // ローディングスピナーが表示される（animate-spinクラスで確認）
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // 商品はまだ表示されない
      expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();

      // APIを解決
      resolveProducts!(mockProducts);

      // 商品が表示される
      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });
    });

    it('初期ロード後に商品一覧を表示する', async () => {
      render(<ProductListing user={mockUser} />);

      // 商品が表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 全商品が表示される
      expect(screen.getByText('Oat Milk')).toBeInTheDocument();
      expect(screen.getByText('Vegan Cheese')).toBeInTheDocument();
    });

    it('カテゴリータブを表示する', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // "All / すべて" タブ
      expect(screen.getByRole('button', { name: /All \/ すべて/i })).toBeInTheDocument();

      // 各カテゴリータブ
      expect(screen.getByRole('button', { name: /Meat Alternatives \/ 代替肉/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Dairy Alternatives \/ 乳製品代替/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Snacks \/ スナック/i })).toBeInTheDocument();
    });

    it('初回ロード時にカテゴリーと商品を並列で取得する', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 両方のAPIが呼ばれる
      expect(productApi.getCategories).toHaveBeenCalledTimes(1);
      expect(productApi.getProducts).toHaveBeenCalledTimes(1);
      // 初回はフィルターなしで呼ばれる
      expect(productApi.getProducts).toHaveBeenCalledWith();
    });
  });

  describe('エラーハンドリング', () => {
    it('API失敗時にエラーメッセージを表示する', async () => {
      vi.mocked(productApi.getProducts).mockRejectedValue(new Error('Network error'));

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText(/データの取得に失敗しました/)).toBeInTheDocument();
      });

      // リトライボタンが表示される
      expect(screen.getByRole('button', { name: /Retry \/ 再試行/i })).toBeInTheDocument();
    });
  });

  describe('空状態', () => {
    it('商品が0件の場合はメッセージを表示する', async () => {
      vi.mocked(productApi.getProducts).mockResolvedValue([]);

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText(/No products found \/ 商品が見つかりません/)).toBeInTheDocument();
      });
    });
  });

  describe('カテゴリーフィルタリング', () => {
    it('カテゴリータブをクリックするとそのカテゴリーで商品を取得する', async () => {
      const user = userEvent.setup();
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // "Dairy Alternatives" カテゴリーをクリック
      await user.click(screen.getByRole('button', { name: /Dairy Alternatives \/ 乳製品代替/i }));

      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'dairy-alternatives',
          search: '',
        });
      });
    });

    it('「All」タブをクリックすると全商品を取得する', async () => {
      const user = userEvent.setup();
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // まず別のカテゴリーを選択
      await user.click(screen.getByRole('button', { name: /Snacks \/ スナック/i }));

      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'snacks',
          search: '',
        });
      });

      // 「All」に戻す
      await user.click(screen.getByRole('button', { name: /All \/ すべて/i }));

      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'all',
          search: '',
        });
      });
    });
  });

  describe('検索機能', () => {
    it('検索ボックスに入力すると検索クエリで商品を取得する', async () => {
      const user = userEvent.setup();

      render(<ProductListing user={mockUser} />);

      // 初期ロード完了を待つ
      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 初回ロードでの呼び出し回数を記録
      const initialCallCount = vi.mocked(productApi.getProducts).mock.calls.length;

      // 検索ボックスに入力
      const searchInput = screen.getByPlaceholderText(/Search products/i);
      await user.type(searchInput, 'burger');

      // デバウンス後にAPIが呼ばれることを確認（300ms + 余裕）
      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'all',
          search: 'burger',
        });
      }, { timeout: 1000 });

      // 追加でAPI呼び出しがあったことを確認
      expect(vi.mocked(productApi.getProducts).mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('検索をクリアすると全商品を再取得する', async () => {
      const user = userEvent.setup();

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search products/i);

      // 検索入力
      await user.type(searchInput, 'burger');

      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'all',
          search: 'burger',
        });
      }, { timeout: 1000 });

      // 検索をクリア
      await user.clear(searchInput);

      // 空の検索で再取得
      await waitFor(() => {
        expect(productApi.getProducts).toHaveBeenCalledWith({
          category: 'all',
          search: '',
        });
      }, { timeout: 1000 });
    });
  });

  describe('ページネーション', () => {
    it('6件を超える場合はページネーションを表示する', async () => {
      vi.mocked(productApi.getProducts).mockResolvedValue(mockManyProducts);

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      // ページ1と2のボタンが表示される
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();

      // 1ページ目は6件表示
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 6')).toBeInTheDocument();
      expect(screen.queryByText('Product 7')).not.toBeInTheDocument();
    });

    it('ページ2をクリックすると7件目以降を表示する', async () => {
      vi.mocked(productApi.getProducts).mockResolvedValue(mockManyProducts);
      const user = userEvent.setup();

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      // ページ2をクリック
      await user.click(screen.getByRole('button', { name: '2' }));

      // 7-8件目が表示される
      expect(screen.getByText('Product 7')).toBeInTheDocument();
      expect(screen.getByText('Product 8')).toBeInTheDocument();
      // 1-6件目は非表示
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    });

    it('6件以下の場合はページネーションを表示しない', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // ページ番号ボタンがない
      expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    });
  });

  describe('商品カード表示', () => {
    it('複数カテゴリーを持つ商品は全てのカテゴリータグを表示する', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // Beyond Burger（代替肉 + スナック）のカードを取得
      const burgerCard = screen.getByText('Beyond Burger').closest('a');
      expect(burgerCard).toBeInTheDocument();

      if (burgerCard) {
        // 両方のカテゴリーが表示される
        expect(within(burgerCard).getByText(/Meat Alternatives \/ 代替肉/)).toBeInTheDocument();
        expect(within(burgerCard).getByText(/Snacks \/ スナック/)).toBeInTheDocument();
      }
    });

    it('カテゴリーのない商品は「Uncategorized」を表示する', async () => {
      const productWithoutCategory: ApiProduct = {
        ...mockProducts[0],
        id: 'no-cat',
        name: 'No Category Product',
        nameJa: 'カテゴリーなし商品',
        categories: [],
      };
      vi.mocked(productApi.getProducts).mockResolvedValue([productWithoutCategory]);

      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('No Category Product')).toBeInTheDocument();
      });

      expect(screen.getByText(/Uncategorized \/ 未分類/)).toBeInTheDocument();
    });

    it('商品カードは商品詳細ページへのリンクになっている', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const burgerLink = screen.getByText('Beyond Burger').closest('a');
      expect(burgerLink).toHaveAttribute('href', '/product/prod-1');
    });

    it('商品の評価を星で表示する', async () => {
      render(<ProductListing user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // レビュー数が表示される
      expect(screen.getByText('(120)')).toBeInTheDocument(); // Beyond Burger
      expect(screen.getByText('(80)')).toBeInTheDocument();  // Oat Milk
    });
  });

  describe('ナビゲーション', () => {
    it('未ログイン時は「Login」リンクを表示する', async () => {
      render(<ProductListing user={null} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // Loginリンクが表示される（デスクトップとモバイル両方）
      const loginLinks = screen.getAllByText(/Login/);
      expect(loginLinks.length).toBeGreaterThan(0);
    });

    it('ログイン時は「My Page」リンクを表示する', async () => {
      const loggedInUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        provider: 'google' as const,
      };

      render(<ProductListing user={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // My Pageリンクが表示される
      const myPageLinks = screen.getAllByText(/My/);
      expect(myPageLinks.length).toBeGreaterThan(0);
    });
  });
});
