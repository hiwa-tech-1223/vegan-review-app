package persistence

import (
	"backend/domain/entity"
	"backend/domain/repository"

	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository - 商品リポジトリの生成
func NewProductRepository(db *gorm.DB) repository.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) FindAll(categorySlug, search string) ([]entity.Product, error) {
	var products []entity.Product
	query := r.db.Preload("Category")

	if categorySlug != "" && categorySlug != "all" {
		query = query.Joins("JOIN categories ON categories.id = products.category_id").
			Where("categories.slug = ?", categorySlug)
	}

	if search != "" {
		query = query.Where("products.name ILIKE ? OR products.name_ja ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) FindByID(id string) (*entity.Product, error) {
	var product entity.Product
	if err := r.db.Preload("Category").First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Create(product *entity.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *entity.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id string) error {
	return r.db.Delete(&entity.Product{}, "id = ?", id).Error
}

func (r *productRepository) UpdateRating(productID string, rating float64, count int) error {
	return r.db.Model(&entity.Product{}).Where("id = ?", productID).Updates(map[string]interface{}{
		"rating":       rating,
		"review_count": count,
	}).Error
}

// categoryRepository
type categoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository - カテゴリリポジトリの生成
func NewCategoryRepository(db *gorm.DB) repository.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll() ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepository) FindBySlug(slug string) (*entity.Category, error) {
	var category entity.Category
	if err := r.db.Where("slug = ?", slug).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}
