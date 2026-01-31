package adminusecase

import (
	"backend/domain/entity"
	"backend/domain/repository"
)

// AdminProductUsecase - 管理者向け商品ユースケース
type AdminProductUsecase struct {
	productRepo  repository.ProductRepository
	categoryRepo repository.CategoryRepository
}

// NewAdminProductUsecase - 管理者向け商品ユースケースの生成
func NewAdminProductUsecase(productRepo repository.ProductRepository, categoryRepo repository.CategoryRepository) *AdminProductUsecase {
	return &AdminProductUsecase{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
	}
}

// CreateProduct - 商品作成
func (u *AdminProductUsecase) CreateProduct(product *entity.Product) error {
	return u.productRepo.Create(product)
}

// UpdateProduct - 商品更新
func (u *AdminProductUsecase) UpdateProduct(product *entity.Product) error {
	return u.productRepo.Update(product)
}

// DeleteProduct - 商品削除
func (u *AdminProductUsecase) DeleteProduct(id int64) error {
	return u.productRepo.Delete(id)
}

// GetProduct - 商品詳細取得（更新時に既存データを取得するため）
func (u *AdminProductUsecase) GetProduct(id int64) (*entity.Product, error) {
	return u.productRepo.FindByID(id)
}
