package customer

import "time"

// ステータス定数
const (
	StatusActive    = 0
	StatusBanned    = 1
	StatusSuspended = 2
)

// Customer - 一般カスタマー
type Customer struct {
	ID             int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	GoogleID       string     `json:"googleId" gorm:"uniqueIndex"`
	Email          string     `json:"email" gorm:"uniqueIndex"`
	Name           string     `json:"name"`
	Avatar         string     `json:"avatar"`
	MemberSince    time.Time  `json:"memberSince" gorm:"type:date;default:CURRENT_DATE"`
	Status         int        `json:"status" gorm:"default:0"`
	StatusReason   *string    `json:"statusReason"`
	SuspendedUntil *time.Time `json:"suspendedUntil"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

// TableName - GORMテーブル名
func (Customer) TableName() string {
	return "customers"
}
