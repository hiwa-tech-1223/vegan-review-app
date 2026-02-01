package customerusecase

import (
	"backend/domain/product"
	"backend/domain/review"
	"errors"
)

// ReviewUsecase - レビューユースケース
type ReviewUsecase struct {
	reviewRepo  review.ReviewRepository
	productRepo product.ProductRepository
}

// NewReviewUsecase - レビューユースケースの生成
func NewReviewUsecase(reviewRepo review.ReviewRepository, productRepo product.ProductRepository) *ReviewUsecase {
	return &ReviewUsecase{
		reviewRepo:  reviewRepo,
		productRepo: productRepo,
	}
}

// GetProductReviews - 商品のレビュー一覧取得
func (u *ReviewUsecase) GetProductReviews(productID int64) ([]review.Review, error) {
	return u.reviewRepo.FindByProductID(productID)
}

// GetUserReviews - ユーザーのレビュー一覧取得
func (u *ReviewUsecase) GetUserReviews(userID int64) ([]review.Review, error) {
	return u.reviewRepo.FindByUserID(userID)
}

// CreateReview - レビュー作成
func (u *ReviewUsecase) CreateReview(productID, userID int64, ratingValue int, commentValue string) (*review.Review, error) {
	// Value Object作成（バリデーション）
	rating, err := review.NewRating(ratingValue)
	if err != nil {
		return nil, err
	}

	comment, err := review.NewComment(commentValue)
	if err != nil {
		return nil, err
	}

	// 既にレビュー済みかチェック
	existing, _ := u.reviewRepo.FindByProductIDAndUserID(productID, userID)
	if existing != nil {
		return nil, errors.New("you have already reviewed this product")
	}

	// Entity作成
	r := review.NewReview(productID, userID, rating, comment)

	if err := u.reviewRepo.Create(r); err != nil {
		return nil, err
	}

	// 商品の評価を更新
	if err := u.updateProductRating(productID); err != nil {
		return nil, err
	}

	return r, nil
}

// DeleteReview - レビュー削除
func (u *ReviewUsecase) DeleteReview(id, userID int64, isAdmin bool) error {
	r, err := u.reviewRepo.FindByID(id)
	if err != nil {
		return errors.New("review not found")
	}

	// 権限チェック
	if r.UserID != userID && !isAdmin {
		return errors.New("permission denied")
	}

	productID := r.ProductID
	if err := u.reviewRepo.Delete(id); err != nil {
		return err
	}

	// 商品の評価を更新
	return u.updateProductRating(productID)
}

// UpdateReview - レビュー更新
func (u *ReviewUsecase) UpdateReview(id, userID int64, ratingValue int, commentValue string) (*review.Review, error) {
	// Value Object作成（バリデーション）
	rating, err := review.NewRating(ratingValue)
	if err != nil {
		return nil, err
	}

	comment, err := review.NewComment(commentValue)
	if err != nil {
		return nil, err
	}

	r, err := u.reviewRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// 権限チェック（自分のレビューのみ編集可能）
	if r.UserID != userID {
		return nil, errors.New("permission denied")
	}

	// 値を更新
	r.Rating = rating
	r.Comment = comment

	if err := u.reviewRepo.Update(r); err != nil {
		return nil, err
	}

	// 商品の評価を更新
	if err := u.updateProductRating(r.ProductID); err != nil {
		return nil, err
	}

	return r, nil
}

// updateProductRating - 商品の評価を更新
func (u *ReviewUsecase) updateProductRating(productID int64) error {
	avg, count, err := u.reviewRepo.GetProductRatingStats(productID)
	if err != nil {
		return err
	}
	return u.productRepo.UpdateRating(productID, avg, int(count))
}
