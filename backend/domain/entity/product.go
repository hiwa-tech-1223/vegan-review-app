package entity

import "time"

// Category - 商品カテゴリ
type Category struct {
	ID               string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name             string    `json:"name"`
	NameJa           string    `json:"nameJa"`
	Slug             string    `json:"slug" gorm:"uniqueIndex"`
	CreatedByAdminID *string   `json:"createdByAdminId"`
	UpdatedByAdminID *string   `json:"updatedByAdminId"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// Product - 商品
type Product struct {
	ID               string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Categories       []Category `json:"categories" gorm:"many2many:product_categories;"`
	Name             string     `json:"name"`
	NameJa           string     `json:"nameJa"`
	Description      string     `json:"description"`
	DescriptionJa    string     `json:"descriptionJa"`
	ImageURL         string     `json:"imageUrl" gorm:"column:image_url"`
	Price            *float64   `json:"price"`
	StockQuantity    *int       `json:"stockQuantity"`
	IsAvailable      bool       `json:"isAvailable" gorm:"default:true"`
	Rating           float64    `json:"rating" gorm:"default:0"`
	ReviewCount      int        `json:"reviewCount" gorm:"default:0"`
	CreatedByAdminID *string    `json:"createdByAdminId"`
	UpdatedByAdminID *string    `json:"updatedByAdminId"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}
