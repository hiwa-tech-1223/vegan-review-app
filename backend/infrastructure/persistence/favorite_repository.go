package persistence

import (
	"backend/domain/favorite"

	"gorm.io/gorm"
)

type favoriteRepository struct {
	db *gorm.DB
}

// NewFavoriteRepository - お気に入りリポジトリの生成
func NewFavoriteRepository(db *gorm.DB) favorite.FavoriteRepository {
	return &favoriteRepository{db: db}
}

func (r *favoriteRepository) FindByCustomerID(customerID int64) ([]favorite.Favorite, error) {
	var favorites []favorite.Favorite
	if err := r.db.Preload("Product").Preload("Product.Categories").Where("customer_id = ?", customerID).Find(&favorites).Error; err != nil {
		return nil, err
	}
	return favorites, nil
}

func (r *favoriteRepository) FindByCustomerIDAndProductID(customerID, productID int64) (*favorite.Favorite, error) {
	var fav favorite.Favorite
	if err := r.db.Where("customer_id = ? AND product_id = ?", customerID, productID).First(&fav).Error; err != nil {
		return nil, err
	}
	return &fav, nil
}

func (r *favoriteRepository) Create(fav *favorite.Favorite) error {
	return r.db.Create(fav).Error
}

func (r *favoriteRepository) Delete(customerID, productID int64) error {
	return r.db.Where("customer_id = ? AND product_id = ?", customerID, productID).Delete(&favorite.Favorite{}).Error
}
