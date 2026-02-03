import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/utils';
import { AdminCategoryForm } from './AdminCategoryForm';
import { productApi } from '../../../../api/customer/productApi';
import { categoryApi } from '../../../../api/admin/categoryApi';

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
vi.mock('../../../../api/customer/productApi', () => ({
  productApi: {
    getCategories: vi.fn(),
  },
}));

vi.mock('../../../../api/admin/categoryApi', () => ({
  categoryApi: {
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
  },
}));

// useAuth モック
vi.mock('../../../auth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

// テストデータ
const mockCategories = [
  { id: 1, name: 'Meat Alternatives', nameJa: '代替肉' },
  { id: 2, name: 'Dairy', nameJa: '乳製品代替' },
];

const mockAdmin = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
};

// jsdom に scrollIntoView がないためモック
Element.prototype.scrollIntoView = vi.fn();

describe('AdminCategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {};
    vi.mocked(productApi.getCategories).mockResolvedValue(mockCategories);
  });

  describe('新規作成モード', () => {
    it('タイトルが「Add New Category」になる', () => {
      render(<AdminCategoryForm admin={mockAdmin} />);
      expect(screen.getByText('Add New Category')).toBeInTheDocument();
    });

    it('カテゴリを作成して一覧画面に遷移する', async () => {
      vi.mocked(categoryApi.createCategory).mockResolvedValue({ id: 3 });
      const user = userEvent.setup();

      render(<AdminCategoryForm admin={mockAdmin} />);

      await user.type(screen.getByPlaceholderText('代替肉'), 'スナック');
      await user.type(screen.getByPlaceholderText('Meat Alternatives'), 'Snacks');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(categoryApi.createCategory).toHaveBeenCalledWith(
          { name: 'Snacks', nameJa: 'スナック' },
          'test-token'
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/categories');
    });

    it('空のカテゴリー名（日本語）でバリデーションエラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      // 英語のみ入力
      await user.type(screen.getByPlaceholderText('Meat Alternatives'), 'Snacks');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(screen.getByText('カテゴリー名（日本語）を入力してください')).toBeInTheDocument();
      });

      expect(categoryApi.createCategory).not.toHaveBeenCalled();
    });

    it('空のカテゴリー名（英語）でバリデーションエラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      // 日本語のみ入力
      await user.type(screen.getByPlaceholderText('代替肉'), 'スナック');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(screen.getByText('カテゴリー名（英語）を入力してください')).toBeInTheDocument();
      });

      expect(categoryApi.createCategory).not.toHaveBeenCalled();
    });

    it('英語フィールドに英語が含まれない場合エラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      await user.type(screen.getByPlaceholderText('代替肉'), 'スナック');
      await user.type(screen.getByPlaceholderText('Meat Alternatives'), 'スナック');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(screen.getByText('英語を1文字以上含めてください')).toBeInTheDocument();
      });

      expect(categoryApi.createCategory).not.toHaveBeenCalled();
    });

    it('日本語フィールドに日本語が含まれない場合エラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      await user.type(screen.getByPlaceholderText('代替肉'), 'Snacks');
      await user.type(screen.getByPlaceholderText('Meat Alternatives'), 'Snacks');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(screen.getByText('日本語を1文字以上含めてください')).toBeInTheDocument();
      });

      expect(categoryApi.createCategory).not.toHaveBeenCalled();
    });

    it('onBlurでフィールド単位のバリデーションが動作する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      const nameEnInput = screen.getByPlaceholderText('Meat Alternatives');
      // フォーカスして空のままブラー
      await user.click(nameEnInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('カテゴリー名（英語）を入力してください')).toBeInTheDocument();
      });

      // 入力するとエラーがクリアされる
      await user.type(nameEnInput, 'Snacks');

      expect(screen.queryByText('カテゴリー名（英語）を入力してください')).not.toBeInTheDocument();
    });

    it('文字数カウンターが表示される', () => {
      render(<AdminCategoryForm admin={mockAdmin} />);

      const counters = screen.getAllByText('0/100');
      expect(counters).toHaveLength(2);
    });
  });

  describe('編集モード', () => {
    beforeEach(() => {
      mockParams = { id: '1' };
    });

    it('タイトルが「Edit Category」になる', async () => {
      render(<AdminCategoryForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Edit Category')).toBeInTheDocument();
      });
    });

    it('既存データがフォームに反映される', async () => {
      render(<AdminCategoryForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Meat Alternatives')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('代替肉')).toBeInTheDocument();
    });

    it('更新して一覧画面に遷移する', async () => {
      vi.mocked(categoryApi.updateCategory).mockResolvedValue({ id: 1 });
      const user = userEvent.setup();

      render(<AdminCategoryForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Meat Alternatives')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Meat Alternatives');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Category');

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(categoryApi.updateCategory).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ name: 'Updated Category' }),
          'test-token'
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/categories');
    });

    it('カテゴリが見つからない場合エラーを表示する', async () => {
      mockParams = { id: '999' };

      render(<AdminCategoryForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Category not found')).toBeInTheDocument();
      });
    });
  });

  describe('キャンセル', () => {
    it('キャンセルボタンで一覧画面に戻る', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryForm admin={mockAdmin} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockNavigate).toHaveBeenCalledWith('/admin/categories');
    });
  });

  describe('エラーハンドリング', () => {
    it('作成失敗時にエラーメッセージを表示する', async () => {
      vi.mocked(categoryApi.createCategory).mockRejectedValue(new Error('Failed'));
      const user = userEvent.setup();

      render(<AdminCategoryForm admin={mockAdmin} />);

      await user.type(screen.getByPlaceholderText('代替肉'), 'スナック');
      await user.type(screen.getByPlaceholderText('Meat Alternatives'), 'Snacks');

      await user.click(screen.getByRole('button', { name: 'Add Category' }));

      await waitFor(() => {
        expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
      });
    });

    it('更新失敗時にエラーメッセージを表示する', async () => {
      mockParams = { id: '1' };
      vi.mocked(categoryApi.updateCategory).mockRejectedValue(new Error('Failed'));
      const user = userEvent.setup();

      render(<AdminCategoryForm admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Meat Alternatives')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
      });
    });
  });
});
