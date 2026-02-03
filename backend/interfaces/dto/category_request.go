package dto

// CreateCategoryRequest - カテゴリ作成リクエストDTO
type CreateCategoryRequest struct {
	Name   string `json:"name"`
	NameJa string `json:"nameJa"`
}

// UpdateCategoryRequest - カテゴリ更新リクエストDTO
type UpdateCategoryRequest struct {
	Name   string `json:"name"`
	NameJa string `json:"nameJa"`
}
