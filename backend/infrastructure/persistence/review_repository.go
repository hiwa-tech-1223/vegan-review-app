package persistence

import (
	"time"

	"backend/domain/entity"
	"backend/domain/repository"
	"backend/domain/valueobject"

	"gorm.io/gorm"
)

// reviewModel - GORM用のDBモデル（プリミティブ型）
type reviewModel struct {
	ID        int64           `gorm:"primaryKey;autoIncrement"`
	ProductID int64           `gorm:"column:product_id"`
	Product   *entity.Product `gorm:"foreignKey:ProductID"`
	UserID    int64           `gorm:"column:user_id"`
	User      *entity.User    `gorm:"foreignKey:UserID"`
	Rating    int             `gorm:"column:rating"`
	Comment   string          `gorm:"column:comment"`
	CreatedAt time.Time       `gorm:"column:created_at"`
	UpdatedAt time.Time       `gorm:"column:updated_at"`
}

func (reviewModel) TableName() string {
	return "reviews"
}

// toEntity - DBモデル → ドメインEntity変換
func (m *reviewModel) toEntity() (*entity.Review, error) {
	// DBからの読み込みなので、既存データはバリデーション済みと仮定
	rating, _ := valueobject.NewRating(m.Rating)
	comment, _ := valueobject.NewComment(m.Comment)

	review := &entity.Review{
		ID:        m.ID,
		ProductID: m.ProductID,
		UserID:    m.UserID,
		Rating:    rating,
		Comment:   comment,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		User:      m.User,
		Product:   m.Product,
	}

	return review, nil
}

// fromEntity - ドメインEntity → DBモデル変換
func reviewModelFromEntity(e *entity.Review) *reviewModel {
	return &reviewModel{
		ID:        e.ID,
		ProductID: e.ProductID,
		UserID:    e.UserID,
		Rating:    e.Rating.Int(),
		Comment:   e.Comment.String(),
		CreatedAt: e.CreatedAt,
		UpdatedAt: e.UpdatedAt,
	}
}

type reviewRepository struct {
	db *gorm.DB
}

// NewReviewRepository - レビューリポジトリの生成
func NewReviewRepository(db *gorm.DB) repository.ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) FindByProductID(productID int64) ([]entity.Review, error) {
	var models []reviewModel
	if err := r.db.Preload("User").Where("product_id = ?", productID).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	reviews := make([]entity.Review, 0, len(models))
	for _, m := range models {
		e, err := m.toEntity()
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, *e)
	}
	return reviews, nil
}

func (r *reviewRepository) FindByUserID(userID int64) ([]entity.Review, error) {
	var models []reviewModel
	if err := r.db.Preload("Product").Preload("Product.Categories").Where("user_id = ?", userID).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	reviews := make([]entity.Review, 0, len(models))
	for _, m := range models {
		e, err := m.toEntity()
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, *e)
	}
	return reviews, nil
}

func (r *reviewRepository) FindByID(id int64) (*entity.Review, error) {
	var model reviewModel
	if err := r.db.First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return model.toEntity()
}

func (r *reviewRepository) FindByProductIDAndUserID(productID, userID int64) (*entity.Review, error) {
	var model reviewModel
	if err := r.db.Where("product_id = ? AND user_id = ?", productID, userID).First(&model).Error; err != nil {
		return nil, err
	}
	return model.toEntity()
}

func (r *reviewRepository) Create(review *entity.Review) error {
	model := reviewModelFromEntity(review)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	// Reload with User
	if err := r.db.Preload("User").First(model, "id = ?", model.ID).Error; err != nil {
		return err
	}

	// 結果をEntityに反映
	created, err := model.toEntity()
	if err != nil {
		return err
	}
	*review = *created
	return nil
}

func (r *reviewRepository) Update(review *entity.Review) error {
	if err := r.db.Table("reviews").Where("id = ?", review.ID).Updates(map[string]interface{}{
		"rating":  review.Rating.Int(),
		"comment": review.Comment.String(),
	}).Error; err != nil {
		return err
	}

	// Reload with User
	var model reviewModel
	if err := r.db.Preload("User").First(&model, "id = ?", review.ID).Error; err != nil {
		return err
	}

	// 結果をEntityに反映
	updated, err := model.toEntity()
	if err != nil {
		return err
	}
	*review = *updated
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
