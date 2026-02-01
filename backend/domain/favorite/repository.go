package favorite

// FavoriteRepository - お気に入りリポジトリインターフェース
type FavoriteRepository interface {
	FindByUserID(userID int64) ([]Favorite, error)
	FindByUserIDAndProductID(userID, productID int64) (*Favorite, error)
	Create(favorite *Favorite) error
	Delete(userID, productID int64) error
}
