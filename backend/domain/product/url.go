package product

import (
	"errors"
	"net/url"
	"strings"
)

var (
	ErrURLEmpty   = errors.New("URL is required")
	ErrURLInvalid = errors.New("URL format is invalid")
)

// ImageURL - 必須の画像URL Value Object
type ImageURL string

// NewImageURL - ImageURL を生成（バリデーション付き）
func NewImageURL(value string) (ImageURL, error) {
	trimmed := strings.TrimSpace(value)

	if trimmed == "" {
		return "", ErrURLEmpty
	}
	if !isValidURL(trimmed) {
		return "", ErrURLInvalid
	}

	return ImageURL(trimmed), nil
}

// String - string値を取得
func (u ImageURL) String() string {
	return string(u)
}

// OptionalURL - 任意のURL Value Object（空文字OK）
type OptionalURL struct {
	value *string
}

// NewOptionalURL - OptionalURL を生成（バリデーション付き）
func NewOptionalURL(value *string) (OptionalURL, error) {
	if value == nil {
		return OptionalURL{value: nil}, nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return OptionalURL{value: nil}, nil
	}
	if !isValidURL(trimmed) {
		return OptionalURL{}, ErrURLInvalid
	}

	return OptionalURL{value: &trimmed}, nil
}

// Value - *string値を取得
func (u OptionalURL) Value() *string {
	return u.value
}

// isValidURL - URL形式チェック
func isValidURL(s string) bool {
	u, err := url.ParseRequestURI(s)
	if err != nil {
		return false
	}
	return u.Scheme == "http" || u.Scheme == "https"
}
