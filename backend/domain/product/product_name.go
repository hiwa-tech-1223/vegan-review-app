package product

import (
	"errors"
	"strings"
)

const (
	ProductNameMaxLength = 255
)

var (
	ErrProductNameEmpty   = errors.New("product name is required")
	ErrProductNameTooLong = errors.New("product name must be at most 255 characters")
)

// ProductName - 商品名のValue Object
type ProductName string

// NewProductName - ProductName を生成（バリデーション付き）
func NewProductName(value string) (ProductName, error) {
	trimmed := strings.TrimSpace(value)

	if trimmed == "" {
		return "", ErrProductNameEmpty
	}
	if len(trimmed) > ProductNameMaxLength {
		return "", ErrProductNameTooLong
	}

	return ProductName(trimmed), nil
}

// NewProductNameEn - 英語の ProductName を生成（言語チェック付き）
func NewProductNameEn(value string) (ProductName, error) {
	name, err := NewProductName(value)
	if err != nil {
		return "", err
	}
	if err := ValidateEnglish(string(name)); err != nil {
		return "", err
	}
	return name, nil
}

// NewProductNameJa - 日本語の ProductName を生成（言語チェック付き）
func NewProductNameJa(value string) (ProductName, error) {
	name, err := NewProductName(value)
	if err != nil {
		return "", err
	}
	if err := ValidateJapanese(string(name)); err != nil {
		return "", err
	}
	return name, nil
}

// String - string値を取得
func (n ProductName) String() string {
	return string(n)
}
