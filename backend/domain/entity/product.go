package entity

import "time"

// Category - 商品カテゴリ
type Category struct {
	ID               int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Name             string    `json:"name"`
	NameJa           string    `json:"nameJa"`
	Slug             string    `json:"slug" gorm:"uniqueIndex"`
	CreatedByAdminID *int64    `json:"createdByAdminId"`
	UpdatedByAdminID *int64    `json:"updatedByAdminId"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// Product - 商品
type Product struct {
	ID               int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	Categories       []Category `json:"categories" gorm:"many2many:product_categories;"`
	Name             string     `json:"name"`
	NameJa           string     `json:"nameJa"`
	Description      string     `json:"description"`
	DescriptionJa    string     `json:"descriptionJa"`
	ImageURL         string     `json:"imageUrl" gorm:"column:image_url"`
	AffiliateURL     *string    `json:"affiliateUrl" gorm:"column:affiliate_url"`
	Rating           float64    `json:"rating" gorm:"default:0"`
	ReviewCount      int        `json:"reviewCount" gorm:"default:0"`
	CreatedByAdminID *int64     `json:"createdByAdminId"`
	UpdatedByAdminID *int64     `json:"updatedByAdminId"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}
