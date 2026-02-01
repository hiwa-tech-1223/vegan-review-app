package review

import (
	"backend/domain/product"
	"backend/domain/user"
	"time"
)

// Review - レビュー（ドメインモデル）
type Review struct {
	ID        int64            `json:"id"`
	ProductID int64            `json:"productId"`
	Product   *product.Product `json:"product,omitempty"`
	UserID    int64            `json:"userId"`
	User      *user.User       `json:"user,omitempty"`
	Rating    Rating           `json:"rating"`
	Comment   Comment          `json:"comment"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
}

// NewReview - レビューを生成
func NewReview(productID, userID int64, rating Rating, comment Comment) *Review {
	return &Review{
		ProductID: productID,
		UserID:    userID,
		Rating:    rating,
		Comment:   comment,
	}
}
