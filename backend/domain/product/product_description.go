package product

import (
	"errors"
	"strings"
)

const (
	ProductDescriptionMaxLength = 5000
)

var (
	ErrProductDescriptionEmpty   = errors.New("product description is required")
	ErrProductDescriptionTooLong = errors.New("product description must be at most 5000 characters")
)

// ProductDescription - 商品説明のValue Object
type ProductDescription string

// NewProductDescription - ProductDescription を生成（バリデーション付き）
func NewProductDescription(value string) (ProductDescription, error) {
	trimmed := strings.TrimSpace(value)

	if trimmed == "" {
		return "", ErrProductDescriptionEmpty
	}
	if len(trimmed) > ProductDescriptionMaxLength {
		return "", ErrProductDescriptionTooLong
	}

	return ProductDescription(trimmed), nil
}

// NewProductDescriptionEn - 英語の ProductDescription を生成（言語チェック付き）
func NewProductDescriptionEn(value string) (ProductDescription, error) {
	desc, err := NewProductDescription(value)
	if err != nil {
		return "", err
	}
	if err := ValidateEnglish(string(desc)); err != nil {
		return "", err
	}
	return desc, nil
}

// NewProductDescriptionJa - 日本語の ProductDescription を生成（言語チェック付き）
func NewProductDescriptionJa(value string) (ProductDescription, error) {
	desc, err := NewProductDescription(value)
	if err != nil {
		return "", err
	}
	if err := ValidateJapanese(string(desc)); err != nil {
		return "", err
	}
	return desc, nil
}

// String - string値を取得
func (d ProductDescription) String() string {
	return string(d)
}
