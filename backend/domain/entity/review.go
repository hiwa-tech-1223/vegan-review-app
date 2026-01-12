package entity

import "time"

// Review - レビュー
type Review struct {
	ID        int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	ProductID int64     `json:"productId"`
	Product   *Product  `json:"product" gorm:"foreignKey:ProductID"`
	UserID    int64     `json:"userId"`
	User      *User     `json:"user" gorm:"foreignKey:UserID"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
