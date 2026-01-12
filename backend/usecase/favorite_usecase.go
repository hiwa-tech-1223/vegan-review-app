package usecase

import (
	"backend/domain/entity"
	"backend/domain/repository"
	"errors"
)

// FavoriteUsecase - お気に入りユースケース
type FavoriteUsecase struct {
	favoriteRepo repository.FavoriteRepository
}

// NewFavoriteUsecase - お気に入りユースケースの生成
func NewFavoriteUsecase(favoriteRepo repository.FavoriteRepository) *FavoriteUsecase {
	return &FavoriteUsecase{favoriteRepo: favoriteRepo}
}

// GetUserFavorites - ユーザーのお気に入り一覧取得
func (u *FavoriteUsecase) GetUserFavorites(userID, requestUserID int64) ([]entity.Favorite, error) {
	if userID != requestUserID {
		return nil, errors.New("permission denied")
	}
	return u.favoriteRepo.FindByUserID(userID)
}

// AddFavorite - お気に入り追加
func (u *FavoriteUsecase) AddFavorite(favorite *entity.Favorite, requestUserID int64) error {
	if favorite.UserID != requestUserID {
		return errors.New("permission denied")
	}

	// 既に登録済みかチェック
	existing, _ := u.favoriteRepo.FindByUserIDAndProductID(favorite.UserID, favorite.ProductID)
	if existing != nil {
		return errors.New("already in favorites")
	}

	return u.favoriteRepo.Create(favorite)
}

// RemoveFavorite - お気に入り削除
func (u *FavoriteUsecase) RemoveFavorite(userID, productID, requestUserID int64) error {
	if userID != requestUserID {
		return errors.New("permission denied")
	}
	return u.favoriteRepo.Delete(userID, productID)
}
