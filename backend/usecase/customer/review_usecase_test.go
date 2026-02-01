package customerusecase

import (
	"backend/domain/product"
	"backend/domain/review"
	"errors"
	"testing"
)

// ===== Mock Repositories =====

type mockReviewRepository struct {
	reviews                        []review.Review
	findByIDFunc                   func(id int64) (*review.Review, error)
	findByProductIDAndCustomerFunc func(productID, customerID int64) (*review.Review, error)
	createFunc                     func(r *review.Review) error
	updateFunc                     func(r *review.Review) error
	deleteFunc                     func(id int64) error
	getRatingStatsFunc             func(productID int64) (float64, int64, error)
}

func (m *mockReviewRepository) FindAll() ([]review.Review, error) {
	return m.reviews, nil
}

func (m *mockReviewRepository) FindByProductID(productID int64) ([]review.Review, error) {
	var result []review.Review
	for _, r := range m.reviews {
		if r.ProductID == productID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByCustomerID(customerID int64) ([]review.Review, error) {
	var result []review.Review
	for _, r := range m.reviews {
		if r.CustomerID == customerID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReviewRepository) FindByID(id int64) (*review.Review, error) {
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

func (m *mockReviewRepository) FindByProductIDAndCustomerID(productID, customerID int64) (*review.Review, error) {
	if m.findByProductIDAndCustomerFunc != nil {
		return m.findByProductIDAndCustomerFunc(productID, customerID)
	}
	return nil, errors.New("not found")
}

func (m *mockReviewRepository) Create(r *review.Review) error {
	if m.createFunc != nil {
		return m.createFunc(r)
	}
	return nil
}

func (m *mockReviewRepository) Update(r *review.Review) error {
	if m.updateFunc != nil {
		return m.updateFunc(r)
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
	updateRatingFunc  func(productID int64, rating float64, count int) error
	updateRatingCalls []struct {
		productID int64
		rating    float64
		count     int
	}
}

func (m *mockProductRepository) FindAll(categoryID int64, search string) ([]product.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) FindByID(id int64) (*product.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) Create(p *product.Product) error {
	return nil
}

func (m *mockProductRepository) Update(p *product.Product) error {
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

// ===== Helper functions =====

func mustRating(value int) review.Rating {
	r, _ := review.NewRating(value)
	return r
}

func mustComment(value string) review.Comment {
	c, _ := review.NewComment(value)
	return c
}

// ===== Tests =====

func TestReviewUsecase_CreateReview(t *testing.T) {
	testCases := []struct {
		name             string
		productID        int64
		customerID       int64
		rating           int
		comment          string
		existingReview   *review.Review
		createErr        error
		wantErr          string
		wantRatingUpdate bool
	}{
		{
			name:             "新規レビューを作成できる",
			productID:        1,
			customerID:       1,
			rating:           5,
			comment:          "Great product! I love it!",
			existingReview:   nil,
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:       "既にレビュー済みの場合はエラー",
			productID:  1,
			customerID: 1,
			rating:     5,
			comment:    "Another review text here",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "you have already reviewed this product",
			wantRatingUpdate: false,
		},
		{
			name:             "リポジトリエラー時はエラーを返す",
			productID:        1,
			customerID:       1,
			rating:           4,
			comment:          "Good product review",
			existingReview:   nil,
			createErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
		{
			name:             "評価が範囲外の場合はエラー",
			productID:        1,
			customerID:       1,
			rating:           6,
			comment:          "Invalid rating test",
			existingReview:   nil,
			wantErr:          "rating must be between 1 and 5",
			wantRatingUpdate: false,
		},
		{
			name:             "コメントが短すぎる場合はエラー",
			productID:        1,
			customerID:       1,
			rating:           5,
			comment:          "Short",
			existingReview:   nil,
			wantErr:          "comment must be at least 10 characters",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByProductIDAndCustomerFunc: func(productID, customerID int64) (*review.Review, error) {
					if tc.existingReview != nil {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				createFunc: func(r *review.Review) error {
					return tc.createErr
				},
			}
			mockProductRepo := &mockProductRepository{}
			uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			_, err := uc.CreateReview(tc.productID, tc.customerID, tc.rating, tc.comment)

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
		name              string
		reviewID          int64
		requestCustomerID int64
		isAdmin           bool
		existingReview    *review.Review
		deleteErr         error
		wantErr           string
		wantRatingUpdate  bool
	}{
		{
			name:              "自分のレビューを削除できる",
			reviewID:          1,
			requestCustomerID: 1,
			isAdmin:           false,
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:              "管理者は他人のレビューを削除できる",
			reviewID:          1,
			requestCustomerID: 100,
			isAdmin:           true,
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:              "一般カスタマーは他人のレビューを削除できない",
			reviewID:          1,
			requestCustomerID: 2,
			isAdmin:           false,
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "permission denied",
			wantRatingUpdate: false,
		},
		{
			name:              "存在しないレビューは削除できない",
			reviewID:          999,
			requestCustomerID: 1,
			isAdmin:           false,
			existingReview:    nil,
			wantErr:           "review not found",
			wantRatingUpdate:  false,
		},
		{
			name:              "リポジトリエラー時はエラーを返す",
			reviewID:          1,
			requestCustomerID: 1,
			isAdmin:           false,
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			deleteErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByIDFunc: func(id int64) (*review.Review, error) {
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
			uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			err := uc.DeleteReview(tc.reviewID, tc.requestCustomerID, tc.isAdmin)

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
	mockReviews := []review.Review{
		{ID: 1, ProductID: 1, CustomerID: 1, Rating: mustRating(5)},
		{ID: 2, ProductID: 1, CustomerID: 2, Rating: mustRating(4)},
		{ID: 3, ProductID: 2, CustomerID: 1, Rating: mustRating(3)},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("商品のレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := uc.GetProductReviews(1)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 2 {
			t.Errorf("expected 2 reviews, got %d", len(reviews))
		}
	})

	t.Run("レビューがない商品は空配列を返す", func(t *testing.T) {
		reviews, err := uc.GetProductReviews(999)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return
		}
		if len(reviews) != 0 {
			t.Errorf("expected 0 reviews, got %d", len(reviews))
		}
	})
}

func TestReviewUsecase_GetCustomerReviews(t *testing.T) {
	mockReviews := []review.Review{
		{ID: 1, ProductID: 1, CustomerID: 1, Rating: mustRating(5)},
		{ID: 2, ProductID: 2, CustomerID: 1, Rating: mustRating(4)},
		{ID: 3, ProductID: 1, CustomerID: 2, Rating: mustRating(3)},
	}

	mockReviewRepo := &mockReviewRepository{reviews: mockReviews}
	mockProductRepo := &mockProductRepository{}
	uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

	t.Run("カスタマーのレビュー一覧を取得できる", func(t *testing.T) {
		reviews, err := uc.GetCustomerReviews(1)
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
		name              string
		reviewID          int64
		requestCustomerID int64
		rating            int
		comment           string
		existingReview    *review.Review
		updateErr         error
		wantErr           string
		wantRatingUpdate  bool
	}{
		{
			name:              "自分のレビューを更新できる",
			reviewID:          1,
			requestCustomerID: 1,
			rating:            4,
			comment:           "Updated comment text",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
				Rating:     mustRating(5),
				Comment:    mustComment("Original comment text"),
			},
			wantErr:          "",
			wantRatingUpdate: true,
		},
		{
			name:              "他人のレビューは更新できない",
			reviewID:          1,
			requestCustomerID: 2,
			rating:            4,
			comment:           "Trying to update text",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "permission denied",
			wantRatingUpdate: false,
		},
		{
			name:              "存在しないレビューは更新できない",
			reviewID:          999,
			requestCustomerID: 1,
			rating:            4,
			comment:           "Non-existent review",
			existingReview:    nil,
			wantErr:           "review not found",
			wantRatingUpdate:  false,
		},
		{
			name:              "リポジトリエラー時はエラーを返す",
			reviewID:          1,
			requestCustomerID: 1,
			rating:            4,
			comment:           "Update error test",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			updateErr:        errors.New("database error"),
			wantErr:          "database error",
			wantRatingUpdate: false,
		},
		{
			name:              "評価が範囲外の場合はエラー",
			reviewID:          1,
			requestCustomerID: 1,
			rating:            0,
			comment:           "Rating out of range",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "rating must be between 1 and 5",
			wantRatingUpdate: false,
		},
		{
			name:              "コメントが短すぎる場合はエラー",
			reviewID:          1,
			requestCustomerID: 1,
			rating:            4,
			comment:           "Short",
			existingReview: &review.Review{
				ID:         1,
				ProductID:  1,
				CustomerID: 1,
			},
			wantErr:          "comment must be at least 10 characters",
			wantRatingUpdate: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockReviewRepo := &mockReviewRepository{
				findByIDFunc: func(id int64) (*review.Review, error) {
					if tc.existingReview != nil && tc.existingReview.ID == id {
						return tc.existingReview, nil
					}
					return nil, errors.New("not found")
				},
				updateFunc: func(r *review.Review) error {
					return tc.updateErr
				},
			}
			mockProductRepo := &mockProductRepository{}
			uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

			r, err := uc.UpdateReview(tc.reviewID, tc.requestCustomerID, tc.rating, tc.comment)

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
			if r.Rating.Int() != tc.rating {
				t.Errorf("expected rating %d, got %d", tc.rating, r.Rating.Int())
			}
			if r.Comment.String() != tc.comment {
				t.Errorf("expected comment %q, got %q", tc.comment, r.Comment.String())
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

func TestReviewUsecase_ValidationErrors(t *testing.T) {
	t.Run("Rating validation", func(t *testing.T) {
		mockReviewRepo := &mockReviewRepository{
			findByProductIDAndCustomerFunc: func(productID, customerID int64) (*review.Review, error) {
				return nil, errors.New("not found")
			},
		}
		mockProductRepo := &mockProductRepository{}
		uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

		// 0 は無効
		_, err := uc.CreateReview(1, 1, 0, "Valid comment text")
		if err == nil || err.Error() != "rating must be between 1 and 5" {
			t.Errorf("expected rating validation error, got: %v", err)
		}

		// 6 は無効
		_, err = uc.CreateReview(1, 1, 6, "Valid comment text")
		if err == nil || err.Error() != "rating must be between 1 and 5" {
			t.Errorf("expected rating validation error, got: %v", err)
		}
	})

	t.Run("Comment validation", func(t *testing.T) {
		mockReviewRepo := &mockReviewRepository{
			findByProductIDAndCustomerFunc: func(productID, customerID int64) (*review.Review, error) {
				return nil, errors.New("not found")
			},
		}
		mockProductRepo := &mockProductRepository{}
		uc := NewReviewUsecase(mockReviewRepo, mockProductRepo)

		// 空のコメント
		_, err := uc.CreateReview(1, 1, 5, "")
		if err == nil || err.Error() != "comment is required" {
			t.Errorf("expected empty comment error, got: %v", err)
		}

		// 短すぎるコメント
		_, err = uc.CreateReview(1, 1, 5, "Short")
		if err == nil || err.Error() != "comment must be at least 10 characters" {
			t.Errorf("expected short comment error, got: %v", err)
		}
	})
}
