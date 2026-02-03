package adminusecase

import (
	"backend/domain/product"
	"backend/domain/review"
	"errors"
)

// AdminReviewUsecase - 管理者向けレビューユースケース
type AdminReviewUsecase struct {
	reviewRepo  review.ReviewRepository
	productRepo product.ProductRepository
}

// NewAdminReviewUsecase - 管理者向けレビューユースケースの生成
func NewAdminReviewUsecase(reviewRepo review.ReviewRepository, productRepo product.ProductRepository) *AdminReviewUsecase {
	return &AdminReviewUsecase{
		reviewRepo:  reviewRepo,
		productRepo: productRepo,
	}
}

// GetAllReviews - 全レビュー一覧取得
func (u *AdminReviewUsecase) GetAllReviews() ([]review.Review, error) {
	return u.reviewRepo.FindAll()
}

// DeleteReview - レビュー削除（管理者権限）
func (u *AdminReviewUsecase) DeleteReview(id int64) error {
	r, err := u.reviewRepo.FindByID(id)
	if err != nil {
		return errors.New("review not found")
	}

	productID := r.ProductID
	if err := u.reviewRepo.Delete(id); err != nil {
		return err
	}

	// 商品の評価を再計算
	avg, count, err := u.reviewRepo.GetProductRatingStats(productID)
	if err != nil {
		return err
	}
	return u.productRepo.UpdateRating(productID, avg, int(count))
}
