package customerusecase

import (
	"backend/domain/product"
)

// ProductUsecase - 利用者向け商品ユースケース
type ProductUsecase struct {
	productRepo  product.ProductRepository
	categoryRepo product.CategoryRepository
}

// NewProductUsecase - 利用者向け商品ユースケースの生成
func NewProductUsecase(productRepo product.ProductRepository, categoryRepo product.CategoryRepository) *ProductUsecase {
	return &ProductUsecase{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
	}
}

// GetAllProducts - 商品一覧取得
func (u *ProductUsecase) GetAllProducts(categoryID int64, search string) ([]product.Product, error) {
	return u.productRepo.FindAll(categoryID, search)
}

// GetProduct - 商品詳細取得
func (u *ProductUsecase) GetProduct(id int64) (*product.Product, error) {
	return u.productRepo.FindByID(id)
}

// GetAllCategories - カテゴリ一覧取得
func (u *ProductUsecase) GetAllCategories() ([]product.Category, error) {
	return u.categoryRepo.FindAll()
}
