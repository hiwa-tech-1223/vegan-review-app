package usecase

import (
	"backend/domain/entity"
	"errors"
	"testing"
)

// ===== Mock Repositories =====

type mockReviewRepository struct {
	reviews                    []entity.Review
	findByIDFunc               func(id int64) (*entity.Review, error)
	findByProductIDAndUserFunc func(productID, userID int64) (*entity.Review, error)
	createFunc                 func(review *entity.Review) error
	updateFunc                 func(review *entity.Review) error
	deleteFunc                 func(id int64) error
	getRatingStatsFunc         func(productID int64) (float64, int64, error)
}

func (m *mockReviewRepository) FindByProductID(productID int64) ([]entity.Review, error) {
	var result []entity.Review
	for _, r := range m.reviews {
		if r.ProductID == productID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByUserID(userID int64) ([]entity.Review, error) {
	var result []entity.Review
	for _, r := range m.reviews {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByID(id int64) (*entity.Review, error) {
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

func (m *mockReviewRepository) FindByProductIDAndUserID(productID, userID int64) (*entity.Review, error) {
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

func (m *mockReviewRepository) Update(review *entity.Review) error {
	if m.updateFunc != nil {
		return m.updateFunc(review)
	}
	return nil
}

func (m *mockReviewRepository) Delete(id int64) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(id)
	}
	return nil
}

func (m *mockReviewRepository) GetProductRatingStats(productID int64) (float64, int64, error) {
	if m.getRatingStatsFunc != nil {
		return m.getRatingStatsFunc(productID)
	}
	return 4.5, 10, nil
}

type mockProductRepository struct {
	updateRatingFunc func(productID int64, rating float64, count int) error
	updateRatingCalls []struct {
		productID int64
		rating    float64
		count     int
	}
}

func (m *mockProductRepository) FindAll(categoryID int64, search string) ([]entity.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) FindByID(id int64) (*entity.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) Create(product *entity.Product) error {
	return nil
}

func (m *mockProductRepository) Update(product *entity.Product) error {
	return nil
}

func (m *mockProductRepository) Delete(id int64) error {
	return nil
}

func (m *mockProductRepository) UpdateRating(productID int64, rating float64, count int) error {
	m.updateRatingCalls = append(m.updateRatingCalls, struct {
		productID int64
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
				ProductID: 1,
				UserID:    1,
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
				ProductID: 1,
				UserID:    1,
				Rating:    5,
				Comment:   "Another review",
			},
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			wantErr:          "you have already reviewed this product",
			wantRatingUpdate: false,
		},
		{
			name: "リポジトリエラー時はエラーを返す",
			review: &entity.Review{
				ProductID: 1,
				UserID:    1,
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
				findByProductIDAndUserFunc: func(productID, userID int64) (*entity.Review, error) {
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
		reviewID         int64
		requestUserID    int64
		isAdmin          bool
		existingReview   *entity.Review
		deleteErr        error
		wantErr          string
		wantRatingUpdate bool
	}{
		{
			name:          "自分のレビューを削除できる",
			reviewID:      1,
			requestUserID: 1,
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:          "管理者は他人のレビューを削除できる",
			reviewID:      1,
			requestUserID: 100,
			isAdmin:       true,
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:          "一般ユーザーは他人のレビューを削除できない",
			reviewID:      1,
			requestUserID: 2,
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			wantErr:          "permission denied",
			wantRatingUpdate: false,
		},
		{
			name:             "存在しないレビューは削除できない",
			reviewID:         999,
			requestUserID:    1,
			isAdmin:          false,
			existingReview:   nil,
			wantErr:          "review not found",
			wantRatingUpdate: false,
		},
		{
			name:          "リポジトリエラー時はエラーを返す",
			reviewID:      1,
			requestUserID: 1,
			isAdmin:       false,
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			deleteErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByIDFunc: func(id int64) (*entity.Review, error) {
					if tc.existingReview != nil && tc.existingReview.ID == id {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				deleteFunc: func(id int64) error {
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
		{ID: 1, ProductID: 1, UserID: 1, Rating: 5},
		{ID: 2, ProductID: 1, UserID: 2, Rating: 4},
		{ID: 3, ProductID: 2, UserID: 1, Rating: 3},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("商品のレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := usecase.GetProductReviews(1)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 2 {
			t.Errorf("expected 2 reviews, got %d", len(reviews))
		}
	})

	t.Run("レビューがない商品は空配列を返す", func(t *testing.T) {
		reviews, err := usecase.GetProductReviews(999)
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
		{ID: 1, ProductID: 1, UserID: 1, Rating: 5},
		{ID: 2, ProductID: 2, UserID: 1, Rating: 4},
		{ID: 3, ProductID: 1, UserID: 2, Rating: 3},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("ユーザーのレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := usecase.GetUserReviews(1)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 2 {
			t.Errorf("expected 2 reviews, got %d", len(reviews))
		}
	})
}

func TestReviewUsecase_UpdateReview(t *testing.T) {
	testCases := []struct {
		name             string
		reviewID         int64
		requestUserID    int64
		rating           int
		comment          string
		existingReview   *entity.Review
		updateErr        error
		wantErr          string
		wantRatingUpdate bool
	}{
		{
			name:          "自分のレビューを更新できる",
			reviewID:      1,
			requestUserID: 1,
			rating:        4,
			comment:       "Updated comment",
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
				Rating:    5,
				Comment:   "Original comment",
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:          "他人のレビューは更新できない",
			reviewID:      1,
			requestUserID: 2,
			rating:        4,
			comment:       "Trying to update",
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			wantErr:          "permission denied",
			wantRatingUpdate: false,
		},
		{
			name:             "存在しないレビューは更新できない",
			reviewID:         999,
			requestUserID:    1,
			rating:           4,
			comment:          "Non-existent",
			existingReview:   nil,
			wantErr:          "review not found",
			wantRatingUpdate: false,
		},
		{
			name:          "リポジトリエラー時はエラーを返す",
			reviewID:      1,
			requestUserID: 1,
			rating:        4,
			comment:       "Update error",
			existingReview: &entity.Review{
				ID:        1,
				ProductID: 1,
				UserID:    1,
			},
			updateErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByIDFunc: func(id int64) (*entity.Review, error) {
					if tc.existingReview != nil && tc.existingReview.ID == id {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				updateFunc: func(review *entity.Review) error {
					return tc.updateErr
				},
			}
			mockProductRepo := &mockProductRepository{}
			usecase := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			review, err := usecase.UpdateReview(tc.reviewID, tc.requestUserID, tc.rating, tc.comment)

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

			// 更新後のレビューの値を確認
			if review.Rating != tc.rating {
				t.Errorf("expected rating %d, got %d", tc.rating, review.Rating)
			}
			if review.Comment != tc.comment {
				t.Errorf("expected comment %q, got %q", tc.comment, review.Comment)
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
