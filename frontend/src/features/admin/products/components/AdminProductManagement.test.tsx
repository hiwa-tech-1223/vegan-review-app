import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/utils';
import { AdminProductManagement } from './AdminProductManagement';
import { productApi } from '../../../customer/products/api';
import { adminApi } from '../api';
import { ApiProduct, ApiCategory } from '../../../customer/products/types';

// API モック
vi.mock('../../../customer/products/api', () => ({
  productApi: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  adminApi: {
    deleteProduct: vi.fn(),
  },
}));

// useAuth モック
vi.mock('../../../auth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

// テストデータ
const mockCategories: ApiCategory[] = [
  { id: 1, name: 'Meat Alternatives', nameJa: '代替肉' },
  { id: 2, name: 'Dairy', nameJa: '乳製品代替' },
];

const mockProducts: ApiProduct[] = [
  {
    id: 1,
    name: 'Beyond Burger',
    nameJa: 'ビヨンドバーガー',
    description: 'Plant-based burger',
    descriptionJa: '植物性バーガー',
    imageUrl: 'https://example.com/burger.jpg',
    affiliateUrl: null,
    amazonUrl: null,
    rakutenUrl: null,
    yahooUrl: null,
    categories: [mockCategories[0]],
    rating: 4.5,
    reviewCount: 120,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Oat Milk',
    nameJa: 'オーツミルク',
    description: 'Creamy oat milk',
    descriptionJa: 'クリーミーなオーツミルク',
    imageUrl: 'https://example.com/oatmilk.jpg',
    affiliateUrl: null,
    amazonUrl: null,
    rakutenUrl: null,
    yahooUrl: null,
    categories: [mockCategories[1]],
    rating: 4.2,
    reviewCount: 80,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockAdmin = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
};

describe('AdminProductManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productApi.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(productApi.getCategories).mockResolvedValue(mockCategories);
  });

  describe('初期表示', () => {
    it('ローディング中はスピナーを表示する', async () => {
      let resolveProducts: (value: ApiProduct[]) => void;
      vi.mocked(productApi.getProducts).mockImplementation(
        () => new Promise((resolve) => { resolveProducts = resolve; })
      );

      render(<AdminProductManagement admin={mockAdmin} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveProducts!(mockProducts);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });
    });

    it('商品一覧を表示する', async () => {
      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      expect(screen.getByText('Oat Milk')).toBeInTheDocument();
    });

    it('カテゴリをカンマ区切りで表示する', async () => {
      const productWithMultiCategories: ApiProduct[] = [{
        ...mockProducts[0],
        categories: [mockCategories[0], mockCategories[1]],
      }];
      vi.mocked(productApi.getProducts).mockResolvedValue(productWithMultiCategories);

      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives, Dairy')).toBeInTheDocument();
      });
    });

    it('カテゴリがない商品は「-」を表示する', async () => {
      const productWithoutCategory: ApiProduct[] = [{
        ...mockProducts[0],
        categories: [],
      }];
      vi.mocked(productApi.getProducts).mockResolvedValue(productWithoutCategory);

      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API失敗時にエラーメッセージを表示する', async () => {
      vi.mocked(productApi.getProducts).mockRejectedValue(new Error('Network error'));

      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('検索', () => {
    it('商品名（英語）で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search products...');
      await user.type(searchInput, 'Oat');

      expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();
      expect(screen.getByText('Oat Milk')).toBeInTheDocument();
    });

    it('商品名（日本語）で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search products...');
      await user.type(searchInput, 'オーツ');

      expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();
      expect(screen.getByText('Oat Milk')).toBeInTheDocument();
    });
  });

  describe('カテゴリフィルタ', () => {
    it('カテゴリで絞り込める', async () => {
      const user = userEvent.setup();
      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const categorySelect = screen.getByRole('combobox');
      await user.selectOptions(categorySelect, '2');

      expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();
      expect(screen.getByText('Oat Milk')).toBeInTheDocument();
    });
  });

  describe('削除', () => {
    it('単一削除ができる', async () => {
      vi.mocked(adminApi.deleteProduct).mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 最初の削除ボタンをクリック
      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      expect(adminApi.deleteProduct).toHaveBeenCalledWith('1', 'test-token');

      await waitFor(() => {
        expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();
      });
    });

    it('確認ダイアログでキャンセルすると削除しない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();

      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      expect(adminApi.deleteProduct).not.toHaveBeenCalled();
      expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
    });
  });

  describe('選択', () => {
    it('全選択チェックボックスで全商品を選択/解除できる', async () => {
      const user = userEvent.setup();
      render(<AdminProductManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0]; // ヘッダーの全選択チェックボックス

      // 全選択
      await user.click(selectAllCheckbox);

      // 一括削除ボタンが表示される
      expect(screen.getByText(/Delete Selected/)).toBeInTheDocument();

      // 全解除
      await user.click(selectAllCheckbox);

      // 一括削除ボタンが消える
      expect(screen.queryByText(/Delete Selected/)).not.toBeInTheDocument();
    });
  });
});
