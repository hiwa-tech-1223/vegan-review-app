package valueobject

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

const (
	CommentMinLength = 10
	CommentMaxLength = 1000
)

// エラー定義
var (
	ErrCommentTooShort = fmt.Errorf("comment must be at least %d characters", CommentMinLength)
	ErrCommentTooLong  = fmt.Errorf("comment must be at most %d characters", CommentMaxLength)
	ErrCommentEmpty    = errors.New("comment is required")
)

// Comment - レビューコメントのValue Object
type Comment struct {
	value string
}

// NewComment - Comment を生成（バリデーション付き）
func NewComment(value string) (Comment, error) {
	trimmed := strings.TrimSpace(value)

	if trimmed == "" {
		return Comment{}, ErrCommentEmpty
	}
	if len(trimmed) < CommentMinLength {
		return Comment{}, ErrCommentTooShort
	}
	if len(trimmed) > CommentMaxLength {
		return Comment{}, ErrCommentTooLong
	}

	return Comment{value: trimmed}, nil
}

// String - string値を取得
func (c Comment) String() string {
	return c.value
}

// Length - 文字数を取得
func (c Comment) Length() int {
	return len(c.value)
}

// Equals - 等価性の比較
func (c Comment) Equals(other Comment) bool {
	return c.value == other.value
}

// MarshalJSON - JSON シリアライズ
func (c Comment) MarshalJSON() ([]byte, error) {
	return json.Marshal(c.value)
}
