package usecase

import (
	"backend/domain/favorite"
	"errors"
)

// FavoriteUsecase - お気に入りユースケース
type FavoriteUsecase struct {
	favoriteRepo favorite.FavoriteRepository
}

// NewFavoriteUsecase - お気に入りユースケースの生成
func NewFavoriteUsecase(favoriteRepo favorite.FavoriteRepository) *FavoriteUsecase {
	return &FavoriteUsecase{favoriteRepo: favoriteRepo}
}

// GetCustomerFavorites - カスタマーのお気に入り一覧取得
func (u *FavoriteUsecase) GetCustomerFavorites(customerID, requestCustomerID int64) ([]favorite.Favorite, error) {
	if customerID != requestCustomerID {
		return nil, errors.New("permission denied")
	}
	return u.favoriteRepo.FindByCustomerID(customerID)
}

// AddFavorite - お気に入り追加
func (u *FavoriteUsecase) AddFavorite(fav *favorite.Favorite, requestCustomerID int64) error {
	if fav.CustomerID != requestCustomerID {
		return errors.New("permission denied")
	}

	// 既に登録済みかチェック
	existing, _ := u.favoriteRepo.FindByCustomerIDAndProductID(fav.CustomerID, fav.ProductID)
	if existing != nil {
		return errors.New("already in favorites")
	}

	return u.favoriteRepo.Create(fav)
}

// RemoveFavorite - お気に入り削除
func (u *FavoriteUsecase) RemoveFavorite(customerID, productID, requestCustomerID int64) error {
	if customerID != requestCustomerID {
		return errors.New("permission denied")
	}
	return u.favoriteRepo.Delete(customerID, productID)
}
