import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/utils';
import { AdminProductForm } from './AdminProductForm';
import { productApi } from '../../../products/api';
import { adminApi } from '../api';
import { ApiCategory } from '../../../products/types';

// React Router のモック
const mockNavigate = vi.fn();
let mockParams: { id?: string } = {};
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

// API モック
vi.mock('../../../products/api', () => ({
  productApi: {
    getCategories: vi.fn(),
    getProduct: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  adminApi: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
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
  { id: 3, name: 'Snacks', nameJa: 'スナック' },
];

const mockProduct = {
  id: 1,
  name: 'Beyond Burger',
  nameJa: 'ビヨンドバーガー',
  description: 'Plant-based burger',
  descriptionJa: '植物性バーガー',
  imageUrl: 'https://example.com/burger.jpg',
  affiliateUrl: null,
  amazonUrl: 'https://amazon.co.jp/test',
  rakutenUrl: null,
  yahooUrl: null,
  categories: [mockCategories[0], mockCategories[2]],
  rating: 4.5,
  reviewCount: 120,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockAdmin = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
};

describe('AdminProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {};
    vi.mocked(productApi.getCategories).mockResolvedValue(mockCategories);
  });

  describe('新規作成モード', () => {
    it('カテゴリ一覧をチェックボックスで表示する', async () => {
      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives / 代替肉')).toBeInTheDocument();
      });

      expect(screen.getByText('Dairy / 乳製品代替')).toBeInTheDocument();
      expect(screen.getByText('Snacks / スナック')).toBeInTheDocument();
    });

    it('タイトルが「Add New Product」になる', async () => {
      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });
    });

    it('カテゴリ未選択でバリデーションエラーを表示する', async () => {
      vi.mocked(adminApi.createProduct).mockResolvedValue({ id: 1 });
      const user = userEvent.setup();

      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });

      // 必須フィールドを入力
      await user.type(screen.getByPlaceholderText('ビヨンドバーガー'), 'テスト商品');
      await user.type(screen.getByPlaceholderText('Beyond Burger'), 'Test Product');
      await user.type(screen.getByPlaceholderText(/製品の説明を日本語で/), '説明文です');
      await user.type(screen.getByPlaceholderText(/Enter product description/), 'Description');
      await user.type(screen.getByPlaceholderText('https://example.com/image.jpg'), 'https://example.com/img.jpg');

      // カテゴリ未選択のまま送信
      const submitButton = screen.getByRole('button', { name: 'Add Product' });
      await user.click(submitButton);

      await waitFor(() => {
        const messages = screen.getAllByText('少なくとも1つのカテゴリーを選択してください');
        expect(messages.length).toBeGreaterThanOrEqual(1);
      });

      expect(adminApi.createProduct).not.toHaveBeenCalled();
    });

    it('商品を作成して一覧画面に遷移する', async () => {
      vi.mocked(adminApi.createProduct).mockResolvedValue({ id: 1 });
      const user = userEvent.setup();

      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });

      // フォーム入力
      await user.type(screen.getByPlaceholderText('ビヨンドバーガー'), 'テスト商品');
      await user.type(screen.getByPlaceholderText('Beyond Burger'), 'Test Product');
      await user.type(screen.getByPlaceholderText(/製品の説明を日本語で/), '説明文です');
      await user.type(screen.getByPlaceholderText(/Enter product description/), 'Description');
      await user.type(screen.getByPlaceholderText('https://example.com/image.jpg'), 'https://example.com/img.jpg');

      // カテゴリ選択
      const meatCheckbox = screen.getByRole('checkbox', { name: /Meat Alternatives/ });
      await user.click(meatCheckbox);

      // 送信
      const submitButton = screen.getByRole('button', { name: 'Add Product' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(adminApi.createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Product',
            nameJa: 'テスト商品',
            categoryIds: [1],
          }),
          'test-token'
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
    });

    it('複数カテゴリを選択できる', async () => {
      vi.mocked(adminApi.createProduct).mockResolvedValue({ id: 1 });
      const user = userEvent.setup();

      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });

      // 複数カテゴリ選択
      await user.click(screen.getByRole('checkbox', { name: /Meat Alternatives/ }));
      await user.click(screen.getByRole('checkbox', { name: /Snacks/ }));

      // 両方チェックされている
      expect(screen.getByRole('checkbox', { name: /Meat Alternatives/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Snacks/ })).toBeChecked();

      // トグルで解除
      await user.click(screen.getByRole('checkbox', { name: /Meat Alternatives/ }));
      expect(screen.getByRole('checkbox', { name: /Meat Alternatives/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Snacks/ })).toBeChecked();
    });
  });

  describe('編集モード', () => {
    beforeEach(() => {
      mockParams = { id: '1' };
      vi.mocked(productApi.getProduct).mockResolvedValue(mockProduct);
    });

    it('タイトルが「Edit Product」になる', async () => {
      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
      });
    });

    it('既存データがフォームに反映される', async () => {
      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Beyond Burger')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('ビヨンドバーガー')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Plant-based burger')).toBeInTheDocument();

      // 既存カテゴリがチェックされている
      expect(screen.getByRole('checkbox', { name: /Meat Alternatives/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Snacks/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Dairy/ })).not.toBeChecked();
    });

    it('更新して一覧画面に遷移する', async () => {
      vi.mocked(adminApi.updateProduct).mockResolvedValue({ id: 1 });
      const user = userEvent.setup();

      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Beyond Burger')).toBeInTheDocument();
      });

      // 名前を変更
      const nameInput = screen.getByDisplayValue('Beyond Burger');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Burger');

      // 保存
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(adminApi.updateProduct).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Updated Burger',
            categoryIds: [1, 3],
          }),
          'test-token'
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('キャンセル', () => {
    it('キャンセルボタンで一覧画面に戻る', async () => {
      const user = userEvent.setup();
      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('エラーハンドリング', () => {
    it('作成失敗時にエラーメッセージを表示する', async () => {
      vi.mocked(adminApi.createProduct).mockRejectedValue(new Error('Failed'));
      const user = userEvent.setup();

      render(<AdminProductForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
      });

      // 必須フィールド入力
      await user.type(screen.getByPlaceholderText('ビヨンドバーガー'), 'テスト');
      await user.type(screen.getByPlaceholderText('Beyond Burger'), 'Test');
      await user.type(screen.getByPlaceholderText(/製品の説明を日本語で/), '説明');
      await user.type(screen.getByPlaceholderText(/Enter product description/), 'Desc');
      await user.type(screen.getByPlaceholderText('https://example.com/image.jpg'), 'https://example.com/img.jpg');
      await user.click(screen.getByRole('checkbox', { name: /Meat Alternatives/ }));

      await user.click(screen.getByRole('button', { name: 'Add Product' }));

      await waitFor(() => {
        expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
      });
    });
  });
});
