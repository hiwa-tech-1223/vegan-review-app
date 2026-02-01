package adminusecase

import (
	"backend/domain/product"
	"backend/domain/review"
	"errors"
	"testing"
)

// mockReviewRepo - レビューリポジトリモック
type mockReviewRepo struct {
	findAllFn             func() ([]review.Review, error)
	findByIDFn            func(id int64) (*review.Review, error)
	deleteFn              func(id int64) error
	getProductRatingStats func(productID int64) (float64, int64, error)
}

func (m *mockReviewRepo) FindAll() ([]review.Review, error) {
	if m.findAllFn != nil {
		return m.findAllFn()
	}
	return []review.Review{}, nil
}
func (m *mockReviewRepo) FindByProductID(_ int64) ([]review.Review, error) { return nil, nil }
func (m *mockReviewRepo) FindByCustomerID(_ int64) ([]review.Review, error) { return nil, nil }
func (m *mockReviewRepo) FindByID(id int64) (*review.Review, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	rating, _ := review.NewRating(5)
	comment, _ := review.NewComment("Great product")
	return &review.Review{ID: id, ProductID: 1, CustomerID: 1, Rating: rating, Comment: comment}, nil
}
func (m *mockReviewRepo) FindByProductIDAndCustomerID(_, _ int64) (*review.Review, error) {
	return nil, nil
}
func (m *mockReviewRepo) Create(_ *review.Review) error { return nil }
func (m *mockReviewRepo) Update(_ *review.Review) error { return nil }
func (m *mockReviewRepo) Delete(id int64) error {
	if m.deleteFn != nil {
		return m.deleteFn(id)
	}
	return nil
}
func (m *mockReviewRepo) GetProductRatingStats(productID int64) (float64, int64, error) {
	if m.getProductRatingStats != nil {
		return m.getProductRatingStats(productID)
	}
	return 4.0, 3, nil
}

// mockProductRepoForReview - 商品リポジトリモック
type mockProductRepoForReview struct {
	updateRatingFn func(productID int64, rating float64, count int) error
}

func (m *mockProductRepoForReview) FindAll(_ int64, _ string) ([]product.Product, error) {
	return nil, nil
}
func (m *mockProductRepoForReview) FindByID(_ int64) (*product.Product, error) { return nil, nil }
func (m *mockProductRepoForReview) Create(_ *product.Product) error             { return nil }
func (m *mockProductRepoForReview) Update(_ *product.Product) error             { return nil }
func (m *mockProductRepoForReview) Delete(_ int64) error                        { return nil }
func (m *mockProductRepoForReview) UpdateRating(productID int64, rating float64, count int) error {
	if m.updateRatingFn != nil {
		return m.updateRatingFn(productID, rating, count)
	}
	return nil
}

func TestGetAllReviews_Success(t *testing.T) {
	rating, _ := review.NewRating(5)
	comment, _ := review.NewComment("Great")
	reviewRepo := &mockReviewRepo{
		findAllFn: func() ([]review.Review, error) {
			return []review.Review{
				{ID: 1, ProductID: 1, CustomerID: 1, Rating: rating, Comment: comment},
				{ID: 2, ProductID: 2, CustomerID: 2, Rating: rating, Comment: comment},
			}, nil
		},
	}
	uc := NewAdminReviewUsecase(reviewRepo, &mockProductRepoForReview{})

	reviews, err := uc.GetAllReviews()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 2 {
		t.Errorf("expected 2 reviews, got %d", len(reviews))
	}
}

func TestGetAllReviews_RepoError(t *testing.T) {
	reviewRepo := &mockReviewRepo{
		findAllFn: func() ([]review.Review, error) {
			return nil, errors.New("db error")
		},
	}
	uc := NewAdminReviewUsecase(reviewRepo, &mockProductRepoForReview{})

	_, err := uc.GetAllReviews()
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestDeleteReview_Success(t *testing.T) {
	deleted := false
	ratingUpdated := false
	reviewRepo := &mockReviewRepo{
		deleteFn: func(_ int64) error {
			deleted = true
			return nil
		},
	}
	productRepo := &mockProductRepoForReview{
		updateRatingFn: func(_ int64, _ float64, _ int) error {
			ratingUpdated = true
			return nil
		},
	}
	uc := NewAdminReviewUsecase(reviewRepo, productRepo)

	err := uc.DeleteReview(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !deleted {
		t.Error("expected review to be deleted")
	}
	if !ratingUpdated {
		t.Error("expected product rating to be updated")
	}
}

func TestDeleteReview_NotFound(t *testing.T) {
	reviewRepo := &mockReviewRepo{
		findByIDFn: func(_ int64) (*review.Review, error) {
			return nil, errors.New("not found")
		},
	}
	uc := NewAdminReviewUsecase(reviewRepo, &mockProductRepoForReview{})

	err := uc.DeleteReview(999)
	if err == nil {
		t.Fatal("expected error for not found review")
	}
	if err.Error() != "review not found" {
		t.Errorf("expected 'review not found', got '%s'", err.Error())
	}
}
