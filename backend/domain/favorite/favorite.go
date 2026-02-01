package favorite

import (
	"backend/domain/customer"
	"backend/domain/product"
	"time"
)

// Favorite - お気に入り
type Favorite struct {
	ID         int64              `json:"id" gorm:"primaryKey;autoIncrement"`
	CustomerID int64              `json:"customerId"`
	Customer   *customer.Customer `json:"customer" gorm:"foreignKey:CustomerID"`
	ProductID  int64              `json:"productId"`
	Product    *product.Product   `json:"product" gorm:"foreignKey:ProductID"`
	CreatedAt  time.Time          `json:"createdAt"`
}
