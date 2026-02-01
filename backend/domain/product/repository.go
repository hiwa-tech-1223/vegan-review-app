package product

// ProductRepository - 商品リポジトリインターフェース
type ProductRepository interface {
	FindAll(categoryID int64, search string) ([]Product, error)
	FindByID(id int64) (*Product, error)
	Create(product *Product) error
	Update(product *Product) error
	Delete(id int64) error
	UpdateRating(productID int64, rating float64, count int) error
}

// CategoryRepository - カテゴリリポジトリインターフェース
type CategoryRepository interface {
	FindAll() ([]Category, error)
	FindByID(id int64) (*Category, error)
}
