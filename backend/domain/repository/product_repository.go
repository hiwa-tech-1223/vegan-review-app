package repository

import "backend/domain/entity"

// ProductRepository - 商品リポジトリインターフェース
type ProductRepository interface {
	FindAll(categoryID int64, search string) ([]entity.Product, error)
	FindByID(id int64) (*entity.Product, error)
	Create(product *entity.Product) error
	Update(product *entity.Product) error
	Delete(id int64) error
	UpdateRating(productID int64, rating float64, count int) error
}

// CategoryRepository - カテゴリリポジトリインターフェース
type CategoryRepository interface {
	FindAll() ([]entity.Category, error)
	FindByID(id int64) (*entity.Category, error)
}
