package entity

import (
	"backend/domain/valueobject"
	"time"
)

// Review - レビュー（ドメインモデル）
type Review struct {
	ID        int64               `json:"id"`
	ProductID int64               `json:"productId"`
	Product   *Product            `json:"product,omitempty"`
	UserID    int64               `json:"userId"`
	User      *User               `json:"user,omitempty"`
	Rating    valueobject.Rating  `json:"rating"`
	Comment   valueobject.Comment `json:"comment"`
	CreatedAt time.Time           `json:"createdAt"`
	UpdatedAt time.Time           `json:"updatedAt"`
}

// NewReview - レビューを生成
func NewReview(productID, userID int64, rating valueobject.Rating, comment valueobject.Comment) *Review {
	return &Review{
		ProductID: productID,
		UserID:    userID,
		Rating:    rating,
		Comment:   comment,
	}
}
