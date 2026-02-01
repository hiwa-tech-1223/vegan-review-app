package review

// ReviewRepository - レビューリポジトリインターフェース
type ReviewRepository interface {
	FindByProductID(productID int64) ([]Review, error)
	FindByUserID(userID int64) ([]Review, error)
	FindByID(id int64) (*Review, error)
	FindByProductIDAndUserID(productID, userID int64) (*Review, error)
	Create(review *Review) error
	Update(review *Review) error
	Delete(id int64) error
	GetProductRatingStats(productID int64) (avg float64, count int64, err error)
}
