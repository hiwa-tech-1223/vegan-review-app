package persistence

import (
	"time"

	"backend/domain/customer"
	"backend/domain/product"
	"backend/domain/review"

	"gorm.io/gorm"
)

// reviewModel - GORM用のDBモデル（プリミティブ型）
type reviewModel struct {
	ID         int64              `gorm:"primaryKey;autoIncrement"`
	ProductID  int64              `gorm:"column:product_id"`
	Product    *product.Product   `gorm:"foreignKey:ProductID"`
	CustomerID int64              `gorm:"column:customer_id"`
	Customer   *customer.Customer `gorm:"foreignKey:CustomerID"`
	Rating     int                `gorm:"column:rating"`
	Comment    string             `gorm:"column:comment"`
	CreatedAt  time.Time          `gorm:"column:created_at"`
	UpdatedAt  time.Time          `gorm:"column:updated_at"`
}

func (reviewModel) TableName() string {
	return "reviews"
}

// toEntity - DBモデル → ドメインEntity変換
func (m *reviewModel) toEntity() (*review.Review, error) {
	// DBからの読み込みなので、既存データはバリデーション済みと仮定
	rating, _ := review.NewRating(m.Rating)
	comment, _ := review.NewComment(m.Comment)

	r := &review.Review{
		ID:         m.ID,
		ProductID:  m.ProductID,
		CustomerID: m.CustomerID,
		Rating:     rating,
		Comment:    comment,
		CreatedAt:  m.CreatedAt,
		UpdatedAt:  m.UpdatedAt,
		Customer:   m.Customer,
		Product:    m.Product,
	}

	return r, nil
}

// fromEntity - ドメインEntity → DBモデル変換
func reviewModelFromEntity(e *review.Review) *reviewModel {
	return &reviewModel{
		ID:         e.ID,
		ProductID:  e.ProductID,
		CustomerID: e.CustomerID,
		Rating:     e.Rating.Int(),
		Comment:    e.Comment.String(),
		CreatedAt:  e.CreatedAt,
		UpdatedAt:  e.UpdatedAt,
	}
}

type reviewRepository struct {
	db *gorm.DB
}

// NewReviewRepository - レビューリポジトリの生成
func NewReviewRepository(db *gorm.DB) review.ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) FindByProductID(productID int64) ([]review.Review, error) {
	var models []reviewModel
	if err := r.db.Preload("Customer").Where("product_id = ?", productID).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	reviews := make([]review.Review, 0, len(models))
	for _, m := range models {
		e, err := m.toEntity()
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, *e)
	}
	return reviews, nil
}

func (r *reviewRepository) FindByCustomerID(customerID int64) ([]review.Review, error) {
	var models []reviewModel
	if err := r.db.Preload("Product").Preload("Product.Categories").Where("customer_id = ?", customerID).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	reviews := make([]review.Review, 0, len(models))
	for _, m := range models {
		e, err := m.toEntity()
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, *e)
	}
	return reviews, nil
}

func (r *reviewRepository) FindByID(id int64) (*review.Review, error) {
	var model reviewModel
	if err := r.db.First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return model.toEntity()
}

func (r *reviewRepository) FindByProductIDAndCustomerID(productID, customerID int64) (*review.Review, error) {
	var model reviewModel
	if err := r.db.Where("product_id = ? AND customer_id = ?", productID, customerID).First(&model).Error; err != nil {
		return nil, err
	}
	return model.toEntity()
}

func (r *reviewRepository) Create(rev *review.Review) error {
	model := reviewModelFromEntity(rev)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	// Reload with Customer
	if err := r.db.Preload("Customer").First(model, "id = ?", model.ID).Error; err != nil {
		return err
	}

	// 結果をEntityに反映
	created, err := model.toEntity()
	if err != nil {
		return err
	}
	*rev = *created
	return nil
}

func (r *reviewRepository) Update(rev *review.Review) error {
	if err := r.db.Table("reviews").Where("id = ?", rev.ID).Updates(map[string]interface{}{
		"rating":  rev.Rating.Int(),
		"comment": rev.Comment.String(),
	}).Error; err != nil {
		return err
	}

	// Reload with Customer
	var model reviewModel
	if err := r.db.Preload("Customer").First(&model, "id = ?", rev.ID).Error; err != nil {
		return err
	}

	// 結果をEntityに反映
	updated, err := model.toEntity()
	if err != nil {
		return err
	}
	*rev = *updated
	return nil
}

func (r *reviewRepository) Delete(id int64) error {
	return r.db.Delete(&reviewModel{}, "id = ?", id).Error
}

func (r *reviewRepository) GetProductRatingStats(productID int64) (float64, int64, error) {
	var result struct {
		Avg   float64
		Count int64
	}
	if err := r.db.Table("reviews").Select("AVG(rating) as avg, COUNT(*) as count").
		Where("product_id = ?", productID).Scan(&result).Error; err != nil {
		return 0, 0, err
	}
	return result.Avg, result.Count, nil
}
