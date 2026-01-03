package usecase

import (
	"backend/domain/entity"
	"errors"
	"testing"
)

// ===== Mock Repositories =====

type mockReviewRepository struct {
	reviews                  []entity.Review
	findByIDFunc             func(id string) (*entity.Review, error)
	findByProductIDAndUserFunc func(productID, userID string) (*entity.Review, error)
	createFunc               func(review *entity.Review) error
	deleteFunc               func(id string) error
	getRatingStatsFunc       func(productID string) (float64, int64, error)
}

func (m *mockReviewRepository) FindByProductID(productID string) ([]entity.Review, error) {
	var result []entity.Review
	for _, r := range m.reviews {
		if r.ProductID == productID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByUserID(userID string) ([]entity.Review, error) {
	var result []entity.Review
	for _, r := range m.reviews {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByID(id string) (*entity.Review, error) {
	if m.findByIDFunc != nil {
		return m.findByIDFunc(id)
	}
	for _, r := range m.reviews {
		if r.ID == id {
			return &r, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockReviewRepository) FindByProductIDAndUserID(productID, userID string) (*entity.Review, error) {
	if m.findByProductIDAndUserFunc != nil {
		return m.findByProductIDAndUserFunc(productID, userID)
	}
	return nil, errors.New("not found")
}

func (m *mockReviewRepository) Create(review *entity.Review) error {
	if m.createFunc != nil {
		return m.createFunc(review)
	}
	return nil
}

func (m *mockReviewRepository) Delete(id string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(id)
	}
	return nil
}

func (m *mockReviewRepository) GetProductRatingStats(productID string) (float64, int64, error) {
	if m.getRatingStatsFunc != nil {
		return m.getRatingStatsFunc(productID)
	}
	return 4.5, 10, nil
}

type mockProductRepository struct {
	updateRatingFunc func(productID string, rating float64, count int) error
	updateRatingCalls []struct {
		productID string
		rating    float64
		count     int
	}
}

func (m *mockProductRepository) FindAll(categorySlug, search string) ([]entity.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) FindByID(id string) (*entity.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) Create(product *entity.Product) error {
	return nil
}

func (m *mockProductRepository) Update(product *entity.Product) error {
	return nil
}

func (m *mockProductRepository) Delete(id string) error {
	return nil
}

func (m *mockProductRepository) UpdateRating(productID string, rating float64, count int) error {
	m.updateRatingCalls = append(m.updateRatingCalls, struct {
		productID string
		rating    float64
		count     int
	}{productID, rating, count})
	if m.updateRatingFunc != nil {
		return m.updateRatingFunc(productID, rating, count)
	}
	return nil
}

// ===== Tests =====

func TestReviewUsecase_CreateReview(t *testing.T) {
	testCases := []struct {
		name             string
		review           *entity.Review
		existingReview   *entity.Review
		createErr        error
		wantErr          string
		wantRatingUpdate bool
	}{
		{
			name: "新規レビューを作成できる",
			review: &entity.Review{
				ProductID: "prod-1",
				UserID:    "user-1",
				Rating:    5,
				Comment:   "Great product!",
			},
			existingReview:   nil,
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name: "既にレビュー済みの場合はエラー",
			review: &entity.Review{
				ProductID: "prod-1",
				UserID:    "user-1",
				Rating:    5,
				Comment:   "Another review",
			},
			existingReview: &entity.Review{
				ID:        "review-1",
				ProductID: "prod-1",
				UserID:    "user-1",
			},
			wantErr:          "you have already reviewed this product",
			wantRatingUpdate: false,
		},
		{
			name: "リポジトリエラー時はエラーを返す",
			review: &entity.Review{
				ProductID: "prod-1",
				UserID:    "user-1",
				Rating:    4,
				Comment:   "Good",
			},
			existingReview:   nil,
			createErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByProductIDAndUserFunc: func(productID, userID string) (*entity.Review, error) {
					if tc.existingReview != nil {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				createFunc: func(review *entity.Review) error {
					return tc.createErr
				},
			}
			mockProductRepo := &mockProductRepository{}
			usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			err := usecase.CreateReview(tc.review)

			if tc.wantErr != "" {
				if err == nil {
					t.Errorf("expected error %q, got nil", tc.wantErr)
					return
				}
				if err.Error() != tc.wantErr {
					t.Errorf("expected error %q, got %q", tc.wantErr, err.Error())
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			// 評価更新が呼ばれたか確認
			if tc.wantRatingUpdate {
				if len(mockProductRepo.updateRatingCalls) == 0 {
					t.Error("expected UpdateRating to be called, but it wasn't")
				}
			}
		})
	}
}

func TestReviewUsecase_DeleteReview(t *testing.T) {
	testCases := []struct {
		name             string
		reviewID         string
		requestUserID    string
		isAdmin          bool
		existingReview   *entity.Review
		deleteErr        error
		wantErr          string
		wantRatingUpdate bool
	}{
		{
			name:          "自分のレビューを削除できる",
			reviewID:      "review-1",
			requestUserID: "user-1",
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        "review-1",
				ProductID: "prod-1",
				UserID:    "user-1",
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:          "管理者は他人のレビューを削除できる",
			reviewID:      "review-1",
			requestUserID: "admin-1",
			isAdmin:       true,
			existingReview: &entity.Review{
				ID:        "review-1",
				ProductID: "prod-1",
				UserID:    "user-1",
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:          "一般ユーザーは他人のレビューを削除できない",
			reviewID:      "review-1",
			requestUserID: "user-2",
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        "review-1",
				ProductID: "prod-1",
				UserID:    "user-1",
			},
			wantErr:          "permission denied",
			wantRatingUpdate: false,
		},
		{
			name:             "存在しないレビューは削除できない",
			reviewID:         "non-existent",
			requestUserID:    "user-1",
			isAdmin:          false,
			existingReview:   nil,
			wantErr:          "review not found",
			wantRatingUpdate: false,
		},
		{
			name:          "リポジトリエラー時はエラーを返す",
			reviewID:      "review-1",
			requestUserID: "user-1",
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        "review-1",
				ProductID: "prod-1",
				UserID:    "user-1",
			},
			deleteErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByIDFunc: func(id string) (*entity.Review, error) {
					if tc.existingReview != nil && tc.existingReview.ID == id {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				deleteFunc: func(id string) error {
					return tc.deleteErr
				},
			}
			mockProductRepo := &mockProductRepository{}
			usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			err := usecase.DeleteReview(tc.reviewID, tc.requestUserID, tc.isAdmin)

			if tc.wantErr != "" {
				if err == nil {
					t.Errorf("expected error %q, got nil", tc.wantErr)
					return
				}
				if err.Error() != tc.wantErr {
					t.Errorf("expected error %q, got %q", tc.wantErr, err.Error())
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			// 評価更新が呼ばれたか確認
			if tc.wantRatingUpdate {
				if len(mockProductRepo.updateRatingCalls) == 0 {
					t.Error("expected UpdateRating to be called, but it wasn't")
				}
			}
		})
	}
}

func TestReviewUsecase_GetProductReviews(t *testing.T) {
	mockReviews := []entity.Review{
		{ID: "review-1", ProductID: "prod-1", UserID: "user-1", Rating: 5},
		{ID: "review-2", ProductID: "prod-1", UserID: "user-2", Rating: 4},
		{ID: "review-3", ProductID: "prod-2", UserID: "user-1", Rating: 3},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("商品のレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := usecase.GetProductReviews("prod-1")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 2 {
			t.Errorf("expected 2 reviews, got %d", len(reviews))
		}
	})

	t.Run("レビューがない商品は空配列を返す", func(t *testing.T) {
		reviews, err := usecase.GetProductReviews("prod-999")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 0 {
			t.Errorf("expected 0 reviews, got %d", len(reviews))
		}
	})
}

func TestReviewUsecase_GetUserReviews(t *testing.T) {
	mockReviews := []entity.Review{
		{ID: "review-1", ProductID: "prod-1", UserID: "user-1", Rating: 5},
		{ID: "review-2", ProductID: "prod-2", UserID: "user-1", Rating: 4},
		{ID: "review-3", ProductID: "prod-1", UserID: "user-2", Rating: 3},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("ユーザーのレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := usecase.GetUserReviews("user-1")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 2 {
			t.Errorf("expected 2 reviews, got %d", len(reviews))
		}
	})
}
