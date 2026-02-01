package product

import (
	"errors"
	"strings"
)

const (
	CategoryNameMaxLength = 100
)

var (
	ErrCategoryNameEmpty   = errors.New("category name is required")
	ErrCategoryNameTooLong = errors.New("category name must be at most 100 characters")
)

// CategoryName - カテゴリ名のValue Object
type CategoryName string

// NewCategoryName - CategoryName を生成（バリデーション付き）
func NewCategoryName(value string) (CategoryName, error) {
	trimmed := strings.TrimSpace(value)

	if trimmed == "" {
		return "", ErrCategoryNameEmpty
	}
	if len(trimmed) > CategoryNameMaxLength {
		return "", ErrCategoryNameTooLong
	}

	return CategoryName(trimmed), nil
}

// NewCategoryNameEn - 英語の CategoryName を生成（言語チェック付き）
func NewCategoryNameEn(value string) (CategoryName, error) {
	name, err := NewCategoryName(value)
	if err != nil {
		return "", err
	}
	if err := ValidateEnglish(string(name)); err != nil {
		return "", err
	}
	return name, nil
}

// NewCategoryNameJa - 日本語の CategoryName を生成（言語チェック付き）
func NewCategoryNameJa(value string) (CategoryName, error) {
	name, err := NewCategoryName(value)
	if err != nil {
		return "", err
	}
	if err := ValidateJapanese(string(name)); err != nil {
		return "", err
	}
	return name, nil
}

// String - string値を取得
func (n CategoryName) String() string {
	return string(n)
}
