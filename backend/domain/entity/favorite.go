package entity

import "time"

// Favorite - お気に入り
type Favorite struct {
	ID        int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    int64     `json:"userId"`
	User      *User     `json:"user" gorm:"foreignKey:UserID"`
	ProductID int64     `json:"productId"`
	Product   *Product  `json:"product" gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"createdAt"`
}
