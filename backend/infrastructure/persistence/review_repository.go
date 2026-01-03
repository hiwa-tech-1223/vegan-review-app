package persistence

import (
	"backend/domain/entity"
	"backend/domain/repository"

	"gorm.io/gorm"
)

type reviewRepository struct {
	db *gorm.DB
}

// NewReviewRepository - レビューリポジトリの生成
func NewReviewRepository(db *gorm.DB) repository.ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) FindByProductID(productID string) ([]entity.Review, error) {
	var reviews []entity.Review
	if err := r.db.Preload("User").Where("product_id = ?", productID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		return nil, err
	}
	return reviews, nil
}

func (r *reviewRepository) FindByUserID(userID string) ([]entity.Review, error) {
	var reviews []entity.Review
	if err := r.db.Preload("Product").Preload("Product.Categories").Where("user_id = ?", userID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		return nil, err
	}
	return reviews, nil
}

func (r *reviewRepository) FindByID(id string) (*entity.Review, error) {
	var review entity.Review
	if err := r.db.First(&review, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) FindByProductIDAndUserID(productID, userID string) (*entity.Review, error) {
	var review entity.Review
	if err := r.db.Where("product_id = ? AND user_id = ?", productID, userID).First(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) Create(review *entity.Review) error {
	if err := r.db.Create(review).Error; err != nil {
		return err
	}
	// Reload with User
	return r.db.Preload("User").First(review, "id = ?", review.ID).Error
}

func (r *reviewRepository) Delete(id string) error {
	return r.db.Delete(&entity.Review{}, "id = ?", id).Error
}

func (r *reviewRepository) GetProductRatingStats(productID string) (float64, int64, error) {
	var result struct {
		Avg   float64
		Count int64
	}
	if err := r.db.Model(&entity.Review{}).Select("AVG(rating) as avg, COUNT(*) as count").
		Where("product_id = ?", productID).Scan(&result).Error; err != nil {
		return 0, 0, err
	}
	return result.Avg, result.Count, nil
}
