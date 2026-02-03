package product

import (
	"errors"
	"regexp"
)

var (
	ErrMustContainEnglish  = errors.New("must contain at least one English letter")
	ErrMustContainJapanese = errors.New("must contain at least one Japanese character")

	englishPattern  = regexp.MustCompile(`[a-zA-Z]`)
	japanesePattern = regexp.MustCompile(`[\x{3040}-\x{309F}\x{30A0}-\x{30FF}\x{4E00}-\x{9FFF}]`)
)

// ValidateEnglish - 英語を1文字以上含むか検証
func ValidateEnglish(value string) error {
	if !englishPattern.MatchString(value) {
		return ErrMustContainEnglish
	}
	return nil
}

// ValidateJapanese - 日本語を1文字以上含むか検証
func ValidateJapanese(value string) error {
	if !japanesePattern.MatchString(value) {
		return ErrMustContainJapanese
	}
	return nil
}
