package dto

// CreateProductRequest - 商品作成リクエストDTO
type CreateProductRequest struct {
	Name          string  `json:"name"`
	NameJa        string  `json:"nameJa"`
	Description   string  `json:"description"`
	DescriptionJa string  `json:"descriptionJa"`
	ImageURL      string  `json:"imageUrl"`
	AffiliateURL  *string `json:"affiliateUrl"`
	AmazonURL     *string `json:"amazonUrl"`
	RakutenURL    *string `json:"rakutenUrl"`
	YahooURL      *string `json:"yahooUrl"`
	CategoryIDs   []int64 `json:"categoryIds"`
}

// UpdateProductRequest - 商品更新リクエストDTO
type UpdateProductRequest struct {
	Name          string  `json:"name"`
	NameJa        string  `json:"nameJa"`
	Description   string  `json:"description"`
	DescriptionJa string  `json:"descriptionJa"`
	ImageURL      string  `json:"imageUrl"`
	AffiliateURL  *string `json:"affiliateUrl"`
	AmazonURL     *string `json:"amazonUrl"`
	RakutenURL    *string `json:"rakutenUrl"`
	YahooURL      *string `json:"yahooUrl"`
	CategoryIDs   []int64 `json:"categoryIds"`
}
