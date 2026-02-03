import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/utils';
import { AdminReviewManagement } from './AdminReviewManagement';
import { adminReviewApi } from '../../../../api/admin/reviewApi';
import { ApiReview } from '../../../../api/customer/reviewTypes';

// API モック
vi.mock('../../../../api/admin/reviewApi', () => ({
  adminReviewApi: {
    getAllReviews: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

// useAuth モック
vi.mock('../../../auth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

// StarRating モック
vi.mock('../../../../components/StarRating', () => ({
  StarRating: ({ rating }: { rating: number }) => <span data-testid="star-rating">{rating} stars</span>,
}));

// テストデータ
const mockReviews: ApiReview[] = [
  {
    id: 1,
    productId: 1,
    customerId: 1,
    customer: { id: 1, name: 'Alice', avatar: 'https://example.com/alice.jpg' },
    product: {
      id: 1, name: 'Tofu Burger', nameJa: '豆腐バーガー', description: '', descriptionJa: '',
      imageUrl: 'https://example.com/tofu.jpg', affiliateUrl: null, amazonUrl: null, rakutenUrl: null, yahooUrl: null,
      categories: [], rating: 4.5, reviewCount: 10, createdAt: '', updatedAt: '',
    },
    rating: 5,
    comment: 'Excellent product!',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    productId: 2,
    customerId: 2,
    customer: { id: 2, name: 'Bob', avatar: 'https://example.com/bob.jpg' },
    product: {
      id: 2, name: 'Soy Milk', nameJa: '豆乳', description: '', descriptionJa: '',
      imageUrl: 'https://example.com/soy.jpg', affiliateUrl: null, amazonUrl: null, rakutenUrl: null, yahooUrl: null,
      categories: [], rating: 3.0, reviewCount: 5, createdAt: '', updatedAt: '',
    },
    rating: 3,
    comment: 'Average taste',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

const mockAdmin = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
};

describe('AdminReviewManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminReviewApi.getAllReviews).mockResolvedValue(mockReviews);
  });

  describe('初期表示', () => {
    it('ローディング中はスピナーを表示する', async () => {
      let resolveReviews: (value: ApiReview[]) => void;
      vi.mocked(adminReviewApi.getAllReviews).mockImplementation(
        () => new Promise((resolve) => { resolveReviews = resolve; })
      );

      render(<AdminReviewManagement admin={mockAdmin} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveReviews!(mockReviews);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });
    });

    it('レビュー一覧を表示する', async () => {
      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Excellent product!')).toBeInTheDocument();
      expect(screen.getByText('Soy Milk')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  describe('検索', () => {
    it('商品名で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by product, customer, or comment...');
      await user.type(searchInput, 'Soy');

      expect(screen.queryByText('Tofu Burger')).not.toBeInTheDocument();
      expect(screen.getByText('Soy Milk')).toBeInTheDocument();
    });

    it('顧客名で検索できる', async () => {
      const user = userEvent.setup();
      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by product, customer, or comment...');
      await user.type(searchInput, 'Alice');

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });

  describe('レーティングフィルタ', () => {
    it('レーティングでフィルタできる', async () => {
      const user = userEvent.setup();
      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      const select = screen.getByDisplayValue('All Ratings');
      await user.selectOptions(select, '5');

      expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      expect(screen.queryByText('Soy Milk')).not.toBeInTheDocument();
    });
  });

  describe('削除', () => {
    it('単一削除ができる', async () => {
      vi.mocked(adminReviewApi.deleteReview).mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(adminReviewApi.deleteReview).toHaveBeenCalledWith(1, 'test-token');
      });

      await waitFor(() => {
        expect(screen.queryByText('Tofu Burger')).not.toBeInTheDocument();
      });
    });

    it('確認ダイアログでキャンセルすると削除しない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();

      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      expect(adminReviewApi.deleteReview).not.toHaveBeenCalled();
      expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
    });

    it('一括削除ができる', async () => {
      vi.mocked(adminReviewApi.deleteReview).mockResolvedValue(undefined);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminReviewManagement admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('Tofu Burger')).toBeInTheDocument();
      });

      // 全選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // 一括削除
      await user.click(screen.getByText(/Delete Selected/));

      await waitFor(() => {
        expect(adminReviewApi.deleteReview).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(screen.getByText('No reviews found')).toBeInTheDocument();
      });
    });
  });
});
