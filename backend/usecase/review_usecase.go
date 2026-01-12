package usecase

import (
	"backend/domain/entity"
	"backend/domain/repository"
	"errors"
)

// ReviewUsecase - レビューユースケース
type ReviewUsecase struct {
	reviewRepo  repository.ReviewRepository
	productRepo repository.ProductRepository
}

// NewReviewUsecase - レビューユースケースの生成
func NewReviewUsecase(reviewRepo repository.ReviewRepository, productRepo repository.ProductRepository) *ReviewUsecase {
	return &ReviewUsecase{
		reviewRepo:  reviewRepo,
		productRepo: productRepo,
	}
}

// GetProductReviews - 商品のレビュー一覧取得
func (u *ReviewUsecase) GetProductReviews(productID int64) ([]entity.Review, error) {
	return u.reviewRepo.FindByProductID(productID)
}

// GetUserReviews - ユーザーのレビュー一覧取得
func (u *ReviewUsecase) GetUserReviews(userID int64) ([]entity.Review, error) {
	return u.reviewRepo.FindByUserID(userID)
}

// CreateReview - レビュー作成
func (u *ReviewUsecase) CreateReview(review *entity.Review) error {
	// 既にレビュー済みかチェック
	existing, _ := u.reviewRepo.FindByProductIDAndUserID(review.ProductID, review.UserID)
	if existing != nil {
		return errors.New("you have already reviewed this product")
	}

	if err := u.reviewRepo.Create(review); err != nil {
		return err
	}

	// 商品の評価を更新
	return u.updateProductRating(review.ProductID)
}

// DeleteReview - レビュー削除
func (u *ReviewUsecase) DeleteReview(id, userID int64, isAdmin bool) error {
	review, err := u.reviewRepo.FindByID(id)
	if err != nil {
		return errors.New("review not found")
	}

	// 権限チェック
	if review.UserID != userID && !isAdmin {
		return errors.New("permission denied")
	}

	productID := review.ProductID
	if err := u.reviewRepo.Delete(id); err != nil {
		return err
	}

	// 商品の評価を更新
	return u.updateProductRating(productID)
}

// UpdateReview - レビュー更新
func (u *ReviewUsecase) UpdateReview(id, userID int64, rating int, comment string) (*entity.Review, error) {
	review, err := u.reviewRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// 権限チェック（自分のレビューのみ編集可能）
	if review.UserID != userID {
		return nil, errors.New("permission denied")
	}

	// 値を更新
	review.Rating = rating
	review.Comment = comment

	if err := u.reviewRepo.Update(review); err != nil {
		return nil, err
	}

	// 商品の評価を更新
	if err := u.updateProductRating(review.ProductID); err != nil {
		return nil, err
	}

	return review, nil
}

// updateProductRating - 商品の評価を更新
func (u *ReviewUsecase) updateProductRating(productID int64) error {
	avg, count, err := u.reviewRepo.GetProductRatingStats(productID)
	if err != nil {
		return err
	}
	return u.productRepo.UpdateRating(productID, avg, int(count))
}
