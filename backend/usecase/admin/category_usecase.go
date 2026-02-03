package adminusecase

import (
	"backend/domain/product"
	"fmt"
)

// AdminCategoryUsecase - 管理者向けカテゴリユースケース
type AdminCategoryUsecase struct {
	categoryRepo product.CategoryRepository
}

// CreateCategoryInput - カテゴリ作成の入力
type CreateCategoryInput struct {
	Name             string
	NameJa           string
	CreatedByAdminID *int64
}

// UpdateCategoryInput - カテゴリ更新の入力
type UpdateCategoryInput struct {
	Name             string
	NameJa           string
	UpdatedByAdminID *int64
}

// NewAdminCategoryUsecase - 管理者向けカテゴリユースケースの生成
func NewAdminCategoryUsecase(categoryRepo product.CategoryRepository) *AdminCategoryUsecase {
	return &AdminCategoryUsecase{categoryRepo: categoryRepo}
}

// CreateCategory - カテゴリ作成
func (u *AdminCategoryUsecase) CreateCategory(input CreateCategoryInput) (*product.Category, error) {
	if err := u.validateCategoryFields(input.Name, input.NameJa); err != nil {
		return nil, err
	}

	c := &product.Category{
		Name:             input.Name,
		NameJa:           input.NameJa,
		CreatedByAdminID: input.CreatedByAdminID,
	}

	if err := u.categoryRepo.Create(c); err != nil {
		return nil, err
	}
	return c, nil
}

// UpdateCategory - カテゴリ更新
func (u *AdminCategoryUsecase) UpdateCategory(id int64, input UpdateCategoryInput) (*product.Category, error) {
	c, err := u.categoryRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if err := u.validateCategoryFields(input.Name, input.NameJa); err != nil {
		return nil, err
	}

	c.Name = input.Name
	c.NameJa = input.NameJa
	c.UpdatedByAdminID = input.UpdatedByAdminID

	if err := u.categoryRepo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

// DeleteCategory - カテゴリ削除
func (u *AdminCategoryUsecase) DeleteCategory(id int64) error {
	return u.categoryRepo.Delete(id)
}

// validateCategoryFields - カテゴリフィールドのバリデーション
func (u *AdminCategoryUsecase) validateCategoryFields(name, nameJa string) error {
	if _, err := product.NewCategoryNameEn(name); err != nil {
		return fmt.Errorf("name: %w", err)
	}
	if _, err := product.NewCategoryNameJa(nameJa); err != nil {
		return fmt.Errorf("nameJa: %w", err)
	}
	return nil
}
