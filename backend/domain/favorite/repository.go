package favorite

// FavoriteRepository - お気に入りリポジトリインターフェース
type FavoriteRepository interface {
	FindByCustomerID(customerID int64) ([]Favorite, error)
	FindByCustomerIDAndProductID(customerID, productID int64) (*Favorite, error)
	Create(favorite *Favorite) error
	Delete(customerID, productID int64) error
}
