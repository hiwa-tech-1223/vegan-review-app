package review

import (
	"backend/domain/customer"
	"backend/domain/product"
	"time"
)

// Review - レビュー（ドメインモデル）
type Review struct {
	ID         int64              `json:"id"`
	ProductID  int64              `json:"productId"`
	Product    *product.Product   `json:"product,omitempty"`
	CustomerID int64              `json:"customerId"`
	Customer   *customer.Customer `json:"customer,omitempty"`
	Rating     Rating             `json:"rating"`
	Comment    Comment            `json:"comment"`
	CreatedAt  time.Time          `json:"createdAt"`
	UpdatedAt  time.Time          `json:"updatedAt"`
}

// NewReview - レビューを生成
func NewReview(productID, customerID int64, rating Rating, comment Comment) *Review {
	return &Review{
		ProductID:  productID,
		CustomerID: customerID,
		Rating:     rating,
		Comment:    comment,
	}
}
