package valueobject

import (
	"encoding/json"
	"errors"
)

// ErrInvalidRating - 不正な評価値エラー
var ErrInvalidRating = errors.New("rating must be between 1 and 5")

// Rating - レビュー評価（1〜5）のValue Object
type Rating struct {
	value int
}

// NewRating - Rating を生成（バリデーション付き）
func NewRating(value int) (Rating, error) {
	if value < 1 || value > 5 {
		return Rating{}, ErrInvalidRating
	}
	return Rating{value: value}, nil
}

// Int - int値を取得
func (r Rating) Int() int {
	return r.value
}

// Equals - 等価性の比較
func (r Rating) Equals(other Rating) bool {
	return r.value == other.value
}

// MarshalJSON - JSON シリアライズ
func (r Rating) MarshalJSON() ([]byte, error) {
	return json.Marshal(r.value)
}
