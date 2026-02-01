package persistence

import (
	"backend/domain/customer"

	"gorm.io/gorm"
)

type customerRepository struct {
	db *gorm.DB
}

// NewCustomerRepository - カスタマーリポジトリの生成
func NewCustomerRepository(db *gorm.DB) customer.CustomerRepository {
	return &customerRepository{db: db}
}

func (r *customerRepository) FindByID(id int64) (*customer.Customer, error) {
	var c customer.Customer
	if err := r.db.First(&c, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *customerRepository) FindByGoogleID(googleID string) (*customer.Customer, error) {
	var c customer.Customer
	if err := r.db.Where("google_id = ?", googleID).First(&c).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *customerRepository) FindAllWithReviewCount() ([]customer.Customer, map[int64]int, error) {
	type row struct {
		customer.Customer
		ReviewCount int `gorm:"column:review_count"`
	}

	var rows []row
	if err := r.db.Table("customers").
		Select("customers.*, COALESCE(rc.review_count, 0) AS review_count").
		Joins("LEFT JOIN (SELECT customer_id, COUNT(*) AS review_count FROM reviews GROUP BY customer_id) rc ON rc.customer_id = customers.id").
		Order("customers.created_at DESC").
		Scan(&rows).Error; err != nil {
		return nil, nil, err
	}

	customers := make([]customer.Customer, len(rows))
	reviewCounts := make(map[int64]int, len(rows))
	for i, r := range rows {
		customers[i] = r.Customer
		reviewCounts[r.Customer.ID] = r.ReviewCount
	}
	return customers, reviewCounts, nil
}

func (r *customerRepository) Create(c *customer.Customer) error {
	return r.db.Create(c).Error
}

func (r *customerRepository) Update(c *customer.Customer) error {
	return r.db.Save(c).Error
}
