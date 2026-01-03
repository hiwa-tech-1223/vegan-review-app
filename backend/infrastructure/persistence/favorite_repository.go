package persistence

import (
	"backend/domain/entity"
	"backend/domain/repository"

	"gorm.io/gorm"
)

type favoriteRepository struct {
	db *gorm.DB
}

// NewFavoriteRepository - お気に入りリポジトリの生成
func NewFavoriteRepository(db *gorm.DB) repository.FavoriteRepository {
	return &favoriteRepository{db: db}
}

func (r *favoriteRepository) FindByUserID(userID string) ([]entity.Favorite, error) {
	var favorites []entity.Favorite
	if err := r.db.Preload("Product").Preload("Product.Categories").Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		return nil, err
	}
	return favorites, nil
}

func (r *favoriteRepository) FindByUserIDAndProductID(userID, productID string) (*entity.Favorite, error) {
	var favorite entity.Favorite
	if err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).First(&favorite).Error; err != nil {
		return nil, err
	}
	return &favorite, nil
}

func (r *favoriteRepository) Create(favorite *entity.Favorite) error {
	return r.db.Create(favorite).Error
}

func (r *favoriteRepository) Delete(userID, productID string) error {
	return r.db.Where("user_id = ? AND product_id = ?", userID, productID).Delete(&entity.Favorite{}).Error
}
