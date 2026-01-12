package repository

import "backend/domain/entity"

// ReviewRepository - レビューリポジトリインターフェース
type ReviewRepository interface {
	FindByProductID(productID int64) ([]entity.Review, error)
	FindByUserID(userID int64) ([]entity.Review, error)
	FindByID(id int64) (*entity.Review, error)
	FindByProductIDAndUserID(productID, userID int64) (*entity.Review, error)
	Create(review *entity.Review) error
	Update(review *entity.Review) error
	Delete(id int64) error
	GetProductRatingStats(productID int64) (avg float64, count int64, err error)
}
