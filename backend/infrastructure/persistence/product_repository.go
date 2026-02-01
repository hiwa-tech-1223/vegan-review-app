package persistence

import (
	"backend/domain/product"

	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository - 商品リポジトリの生成
func NewProductRepository(db *gorm.DB) product.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) FindAll(categoryID int64, search string) ([]product.Product, error) {
	var products []product.Product
	query := r.db.Preload("Categories")

	if categoryID > 0 {
		// 多対多: product_categories中間テーブルを経由してJOIN
		query = query.Joins("JOIN product_categories ON product_categories.product_id = products.id").
			Where("product_categories.category_id = ?", categoryID)
	}

	if search != "" {
		query = query.Where("products.name ILIKE ? OR products.name_ja ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Order("products.created_at DESC, products.id ASC").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) FindByID(id int64) (*product.Product, error) {
	var p product.Product
	if err := r.db.Preload("Categories").First(&p, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *productRepository) Create(p *product.Product) error {
	return r.db.Create(p).Error
}

func (r *productRepository) Update(p *product.Product) error {
	// トランザクション内でカテゴリーの関連を更新
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 商品の基本情報を更新
		if err := tx.Save(p).Error; err != nil {
			return err
		}
		// カテゴリーの関連を置き換え
		if err := tx.Model(p).Association("Categories").Replace(p.Categories); err != nil {
			return err
		}
		return nil
	})
}

func (r *productRepository) Delete(id int64) error {
	return r.db.Delete(&product.Product{}, "id = ?", id).Error
}

func (r *productRepository) UpdateRating(productID int64, rating float64, count int) error {
	return r.db.Model(&product.Product{}).Where("id = ?", productID).Updates(map[string]interface{}{
		"rating":       rating,
		"review_count": count,
	}).Error
}

// categoryRepository
type categoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository - カテゴリリポジトリの生成
func NewCategoryRepository(db *gorm.DB) product.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll() ([]product.Category, error) {
	var categories []product.Category
	if err := r.db.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepository) FindByID(id int64) (*product.Category, error) {
	var category product.Category
	if err := r.db.First(&category, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &category, nil
}
