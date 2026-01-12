package repository

import "backend/domain/entity"

// FavoriteRepository - お気に入りリポジトリインターフェース
type FavoriteRepository interface {
	FindByUserID(userID int64) ([]entity.Favorite, error)
	FindByUserIDAndProductID(userID, productID int64) (*entity.Favorite, error)
	Create(favorite *entity.Favorite) error
	Delete(userID, productID int64) error
}
