import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/utils';
import { ProductDetail } from './ProductDetail';
import { productApi } from '../api';
import { reviewApi } from '../../reviews';
import { userApi } from '../../users';
import { ApiProduct } from '../types';

// React Router のモック
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

// API モック
vi.mock('../api', () => ({
  productApi: {
    getProduct: vi.fn(),
  },
}));

vi.mock('../../reviews', () => ({
  reviewApi: {
    getProductReviews: vi.fn(),
    createReview: vi.fn(),
    updateReview: vi.fn(),
  },
}));

vi.mock('../../users', () => ({
  userApi: {
    getFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  },
}));

// useAuth モック
const mockUseAuth = vi.fn();
vi.mock('../../auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// テストデータ
const mockProduct: ApiProduct = {
  id: 1,
  name: 'Beyond Burger',
  nameJa: 'ビヨンドバーガー',
  description: 'Plant-based burger patty',
  descriptionJa: '植物性バーガーパティ',
  imageUrl: 'https://example.com/burger.jpg',
  affiliateUrl: null,
  categories: [
    { id: 1, name: 'Meat Alternatives', nameJa: '代替肉', slug: 'meat-alternatives' },
    { id: 2, name: 'Snacks', nameJa: 'スナック', slug: 'snacks' },
  ],
  rating: 4.5,
  reviewCount: 120,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockReviews = [
  {
    id: 1,
    productId: 1,
    userId: 2,
    rating: 5,
    comment: 'Great product!',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    user: { id: 2, name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
  },
  {
    id: 2,
    productId: 1,
    userId: 3,
    rating: 4,
    comment: 'Pretty good',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    user: { id: 3, name: 'Jane Smith', avatar: 'https://example.com/avatar2.jpg' },
  },
];

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
};

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモック設定
    vi.mocked(productApi.getProduct).mockResolvedValue(mockProduct);
    vi.mocked(reviewApi.getProductReviews).mockResolvedValue(mockReviews);
    vi.mocked(userApi.getFavorites).mockResolvedValue([]);
    mockUseAuth.mockReturnValue({ user: null, token: null });
  });

  describe('初期表示', () => {
    it('ローディング中はスピナーを表示する', async () => {
      let resolveProduct: (value: ApiProduct) => void;
      vi.mocked(productApi.getProduct).mockImplementation(
        () => new Promise((resolve) => { resolveProduct = resolve; })
      );

      render(<ProductDetail />);

      // スピナーが表示される
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();

      // 商品情報はまだ表示されない
      expect(screen.queryByText('Beyond Burger')).not.toBeInTheDocument();

      // 解決
      resolveProduct!(mockProduct);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });
    });

    it('商品情報を正しく表示する', async () => {
      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 日本語名
      expect(screen.getByText('ビヨンドバーガー')).toBeInTheDocument();

      // 説明
      expect(screen.getByText('Plant-based burger patty')).toBeInTheDocument();
      expect(screen.getByText('植物性バーガーパティ')).toBeInTheDocument();

      // カテゴリー（複数）
      expect(screen.getByText(/Meat Alternatives \/ 代替肉/)).toBeInTheDocument();
      expect(screen.getByText(/Snacks \/ スナック/)).toBeInTheDocument();

      // レビュー数
      expect(screen.getByText(/120 reviews/)).toBeInTheDocument();
    });

    it('レビュー一覧を表示する', async () => {
      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // レビューが表示される
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Pretty good')).toBeInTheDocument();

      // レビュー投稿者名
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('レビューが0件の場合はメッセージを表示する', async () => {
      vi.mocked(reviewApi.getProductReviews).mockResolvedValue([]);

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('商品取得失敗時にエラーメッセージを表示する', async () => {
      vi.mocked(productApi.getProduct).mockRejectedValue(new Error('Network error'));

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText(/商品の取得に失敗しました/)).toBeInTheDocument();
      });

      // ホームに戻るボタン
      expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
    });
  });

  describe('お気に入り機能', () => {
    it('未ログイン時にお気に入りボタンをクリックするとログインページにリダイレクト', async () => {
      mockUseAuth.mockReturnValue({ user: null, token: null });
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', { name: /Add to Favorites/i });
      await user.click(favoriteButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('ログイン時にお気に入りに追加できる', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });
      vi.mocked(userApi.addFavorite).mockResolvedValue({ id: 1, productId: 1 });
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', { name: /Add to Favorites/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(userApi.addFavorite).toHaveBeenCalledWith(1, 1, 'test-token');
      });

      // ボタンのテキストが変わる
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Added to Favorites/i })).toBeInTheDocument();
      });
    });

    it('お気に入り済みの場合は解除できる', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });
      vi.mocked(userApi.getFavorites).mockResolvedValue([{ productId: 1 }]);
      vi.mocked(userApi.removeFavorite).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Added to Favorites/i })).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', { name: /Added to Favorites/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(userApi.removeFavorite).toHaveBeenCalledWith(1, 1, 'test-token');
      });
    });
  });

  describe('レビュー投稿', () => {
    it('未ログイン時にレビュー投稿するとログインページにリダイレクト', async () => {
      mockUseAuth.mockReturnValue({ user: null, token: null });
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // コメント入力
      const commentInput = screen.getByPlaceholderText(/Share your experience/i);
      await user.type(commentInput, 'Great product!');

      // 投稿ボタンをクリック
      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      await user.click(submitButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('ログイン時にレビューを投稿できる', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });
      const newReview = {
        id: 100,
        productId: 1,
        userId: 1,
        rating: 5,
        comment: 'Amazing!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 1, name: 'Test User', avatar: 'https://example.com/avatar.jpg' },
      };
      vi.mocked(reviewApi.createReview).mockResolvedValue(newReview);
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // コメント入力
      const commentInput = screen.getByPlaceholderText(/Share your experience/i);
      await user.type(commentInput, 'Amazing!');

      // 投稿ボタンをクリック
      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(reviewApi.createReview).toHaveBeenCalledWith(
          1,
          { rating: 5, comment: 'Amazing!' },
          'test-token'
        );
      });

      // 新しいレビューが表示される（テキストエリアとレビューリストの両方に表示される）
      await waitFor(() => {
        const amazingTexts = screen.getAllByText('Amazing!');
        // テキストエリア（編集モード用）とレビューリストの2箇所に表示される
        expect(amazingTexts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('コメントが空の場合は投稿ボタンが無効', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      expect(submitButton).toBeDisabled();
    });

    it('評価を変更できる', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });
      vi.mocked(reviewApi.createReview).mockResolvedValue({
        id: 101,
        productId: 1,
        userId: 1,
        rating: 3,
        comment: 'OK',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 1, name: 'Test User', avatar: 'https://example.com/avatar.jpg' },
      });
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      // 評価セクションの星ボタンを探す（レビューフォーム内）
      const ratingButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent === '★' && btn.closest('form')
      );

      // 3番目の星をクリック（評価3）
      if (ratingButtons[2]) {
        await user.click(ratingButtons[2]);
      }

      // コメント入力
      const commentInput = screen.getByPlaceholderText(/Share your experience/i);
      await user.type(commentInput, 'OK');

      // 投稿
      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(reviewApi.createReview).toHaveBeenCalledWith(
          1,
          { rating: 3, comment: 'OK' },
          'test-token'
        );
      });
    });

    it('レビュー投稿エラー時にエラーメッセージを表示する', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, token: 'test-token' });
      vi.mocked(reviewApi.createReview).mockRejectedValue(
        new Error('you have already reviewed this product')
      );
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText(/Share your experience/i);
      await user.type(commentInput, 'Another review');

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you have already reviewed this product/)).toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーション', () => {
    it('戻るボタンをクリックすると前のページに戻る', async () => {
      const user = userEvent.setup();

      render(<ProductDetail />);

      await waitFor(() => {
        expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back \/ 戻る/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
