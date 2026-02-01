package user

import "time"

// User - 一般ユーザー
type User struct {
	ID          int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	GoogleID    string    `json:"googleId" gorm:"uniqueIndex"`
	Email       string    `json:"email" gorm:"uniqueIndex"`
	Name        string    `json:"name"`
	Avatar      string    `json:"avatar"`
	MemberSince time.Time `json:"memberSince" gorm:"type:date;default:CURRENT_DATE"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// GoogleUserInfo - Googleから取得するユーザー情報
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}
