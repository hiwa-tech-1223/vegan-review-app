package adminusecase

import (
	"backend/domain/product"
	"fmt"
)

// AdminProductUsecase - 管理者向け商品ユースケース
type AdminProductUsecase struct {
	productRepo  product.ProductRepository
	categoryRepo product.CategoryRepository
}

// CreateProductInput - 商品作成の入力
type CreateProductInput struct {
	Name             string
	NameJa           string
	Description      string
	DescriptionJa    string
	ImageURL         string
	AffiliateURL     *string
	AmazonURL        *string
	RakutenURL       *string
	YahooURL         *string
	CategoryIDs      []int64
	CreatedByAdminID *int64
}

// UpdateProductInput - 商品更新の入力
type UpdateProductInput struct {
	Name             string
	NameJa           string
	Description      string
	DescriptionJa    string
	ImageURL         string
	AffiliateURL     *string
	AmazonURL        *string
	RakutenURL       *string
	YahooURL         *string
	CategoryIDs      []int64
	UpdatedByAdminID *int64
}

// NewAdminProductUsecase - 管理者向け商品ユースケースの生成
func NewAdminProductUsecase(productRepo product.ProductRepository, categoryRepo product.CategoryRepository) *AdminProductUsecase {
	return &AdminProductUsecase{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
	}
}

// CreateProduct - 商品作成
func (u *AdminProductUsecase) CreateProduct(input CreateProductInput) (*product.Product, error) {
	if err := u.validateProductFields(input.Name, input.NameJa, input.Description, input.DescriptionJa, input.ImageURL, input.AffiliateURL, input.AmazonURL, input.RakutenURL, input.YahooURL); err != nil {
		return nil, err
	}

	categories, err := u.resolveCategories(input.CategoryIDs)
	if err != nil {
		return nil, err
	}

	p := &product.Product{
		Name:             input.Name,
		NameJa:           input.NameJa,
		Description:      input.Description,
		DescriptionJa:    input.DescriptionJa,
		ImageURL:         input.ImageURL,
		AffiliateURL:     input.AffiliateURL,
		AmazonURL:        input.AmazonURL,
		RakutenURL:       input.RakutenURL,
		YahooURL:         input.YahooURL,
		Categories:       categories,
		CreatedByAdminID: input.CreatedByAdminID,
	}

	if err := u.productRepo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

// UpdateProduct - 商品更新
func (u *AdminProductUsecase) UpdateProduct(id int64, input UpdateProductInput) (*product.Product, error) {
	p, err := u.productRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if err := u.validateProductFields(input.Name, input.NameJa, input.Description, input.DescriptionJa, input.ImageURL, input.AffiliateURL, input.AmazonURL, input.RakutenURL, input.YahooURL); err != nil {
		return nil, err
	}

	categories, err := u.resolveCategories(input.CategoryIDs)
	if err != nil {
		return nil, err
	}

	p.Name = input.Name
	p.NameJa = input.NameJa
	p.Description = input.Description
	p.DescriptionJa = input.DescriptionJa
	p.ImageURL = input.ImageURL
	p.AffiliateURL = input.AffiliateURL
	p.AmazonURL = input.AmazonURL
	p.RakutenURL = input.RakutenURL
	p.YahooURL = input.YahooURL
	p.Categories = categories
	p.UpdatedByAdminID = input.UpdatedByAdminID

	if err := u.productRepo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

// DeleteProduct - 商品削除
func (u *AdminProductUsecase) DeleteProduct(id int64) error {
	return u.productRepo.Delete(id)
}

// GetProduct - 商品詳細取得
func (u *AdminProductUsecase) GetProduct(id int64) (*product.Product, error) {
	return u.productRepo.FindByID(id)
}

// validateProductFields - 商品フィールドのバリデーション
func (u *AdminProductUsecase) validateProductFields(name, nameJa, description, descriptionJa, imageURL string, affiliateURL, amazonURL, rakutenURL, yahooURL *string) error {
	if _, err := product.NewProductName(name); err != nil {
		return fmt.Errorf("name: %w", err)
	}
	if _, err := product.NewProductName(nameJa); err != nil {
		return fmt.Errorf("nameJa: %w", err)
	}
	if _, err := product.NewProductDescription(description); err != nil {
		return fmt.Errorf("description: %w", err)
	}
	if _, err := product.NewProductDescription(descriptionJa); err != nil {
		return fmt.Errorf("descriptionJa: %w", err)
	}
	if _, err := product.NewImageURL(imageURL); err != nil {
		return fmt.Errorf("imageUrl: %w", err)
	}
	if _, err := product.NewOptionalURL(affiliateURL); err != nil {
		return fmt.Errorf("affiliateUrl: %w", err)
	}
	if _, err := product.NewOptionalURL(amazonURL); err != nil {
		return fmt.Errorf("amazonUrl: %w", err)
	}
	if _, err := product.NewOptionalURL(rakutenURL); err != nil {
		return fmt.Errorf("rakutenUrl: %w", err)
	}
	if _, err := product.NewOptionalURL(yahooURL); err != nil {
		return fmt.Errorf("yahooUrl: %w", err)
	}
	return nil
}

// resolveCategories - カテゴリIDの存在チェックとエンティティ取得
func (u *AdminProductUsecase) resolveCategories(categoryIDs []int64) ([]product.Category, error) {
	var categories []product.Category
	for _, id := range categoryIDs {
		cat, err := u.categoryRepo.FindByID(id)
		if err != nil {
			return nil, fmt.Errorf("category ID %d not found", id)
		}
		categories = append(categories, *cat)
	}
	return categories, nil
}
