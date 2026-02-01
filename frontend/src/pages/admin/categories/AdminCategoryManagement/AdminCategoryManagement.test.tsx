import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/utils';
import { AdminCategoryManagement } from './AdminCategoryManagement';
import { productApi } from '../../../../api/customer/productApi';
import { categoryApi } from '../../../../api/admin/categoryApi';
import { Category } from '../../../../api/customer/productTypes';

// API モック
vi.mock('../../../../api/customer/productApi', () => ({
  productApi: {
    getCategories: vi.fn(),
  },
}));

vi.mock('../../../../api/admin/categoryApi', () => ({
  categoryApi: {
    deleteCategory: vi.fn(),
  },
}));

// useAuth モック
vi.mock('../../../auth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

// テストデータ
const mockCategories: Category[] = [
  { id: 1, name: 'Meat Alternatives', nameJa: '代替肉' },
  { id: 2, name: 'Dairy', nameJa: '乳製品代替' },
  { id: 3, name: 'Snacks', nameJa: 'スナック' },
];

const mockAdmin = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
};

describe('AdminCategoryManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productApi.getCategories).mockResolvedValue(mockCategories);
  });

  describe('初期表示', () => {
    it('ローディング中はスピナーを表示する', async () => {
      let resolveCategories: (value: Category[]) => void;
      vi.mocked(productApi.getCategories).mockImplementation(
        () => new Promise((resolve) => { resolveCategories = resolve; })
      );

      render(<AdminCategoryManagement admin={mockAdmin} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveCategories!(mockCategories);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });
    });

    it('カテゴリ一覧を表示する', async () => {
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Snacks')).toBeInTheDocument();
    });

    it('合計件数を表示する', async () => {
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Total: 3 categories')).toBeInTheDocument();
      });
    });
  });

  describe('検索', () => {
    it('カテゴリ名（英語）で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search categories...');
      await user.type(searchInput, 'Dairy');

      expect(screen.queryByText('Meat Alternatives')).not.toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });

    it('カテゴリ名（日本語）で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search categories...');
      await user.type(searchInput, '代替肉');

      expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      expect(screen.queryByText('Dairy')).not.toBeInTheDocument();
    });

    it('一致しない場合は「No categories found」を表示する', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search categories...');
      await user.type(searchInput, 'xxxxxxx');

      expect(screen.getByText('No categories found')).toBeInTheDocument();
    });
  });

  describe('削除', () => {
    it('単一削除ができる', async () => {
      vi.mocked(categoryApi.deleteCategory).mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(categoryApi.deleteCategory).toHaveBeenCalledWith(1, 'test-token');
      });

      await waitFor(() => {
        expect(screen.queryByText('Meat Alternatives')).not.toBeInTheDocument();
      });
    });

    it('確認ダイアログでキャンセルすると削除しない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();

      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      expect(categoryApi.deleteCategory).not.toHaveBeenCalled();
      expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
    });

    it('削除失敗時にアラートを表示する', async () => {
      vi.mocked(categoryApi.deleteCategory).mockRejectedValue(new Error('Failed'));
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      const user = userEvent.setup();

      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('カテゴリーの削除に失敗しました / Failed to delete category');
      });

      // 削除失敗なので一覧に残っている
      expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
    });
  });

  describe('選択', () => {
    it('全選択チェックボックスで全カテゴリを選択/解除できる', async () => {
      const user = userEvent.setup();
      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0];

      // 全選択
      await user.click(selectAllCheckbox);
      expect(screen.getByText(/Delete Selected/)).toBeInTheDocument();

      // 全解除
      await user.click(selectAllCheckbox);
      expect(screen.queryByText(/Delete Selected/)).not.toBeInTheDocument();
    });

    it('一括削除ができる', async () => {
      vi.mocked(categoryApi.deleteCategory).mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminCategoryManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Meat Alternatives')).toBeInTheDocument();
      });

      // 全選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // 一括削除
      await user.click(screen.getByText(/Delete Selected/));

      await waitFor(() => {
        expect(categoryApi.deleteCategory).toHaveBeenCalledTimes(3);
      });

      await waitFor(() => {
        expect(screen.getByText('No categories found')).toBeInTheDocument();
      });
    });
  });
});
