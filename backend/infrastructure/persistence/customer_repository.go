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

func (r *customerRepository) Create(c *customer.Customer) error {
	return r.db.Create(c).Error
}

func (r *customerRepository) Update(c *customer.Customer) error {
	return r.db.Save(c).Error
}
