package valueobject

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

// String - string値を取得
func (n ProductName) String() string {
	return string(n)
}
