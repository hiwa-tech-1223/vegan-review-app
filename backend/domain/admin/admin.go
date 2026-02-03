package admin

import "time"

// ロール名の定数
const (
	RoleSuperAdmin = "super_admin"
	RoleAdmin      = "admin"
	RoleModerator  = "moderator"
)

// Role - 管理者ロール
type Role struct {
	ID          int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string    `json:"name" gorm:"uniqueIndex"`
	NameJa      string    `json:"nameJa" gorm:"column:name_ja"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// TableName - GORMテーブル名
func (Role) TableName() string {
	return "admin_roles"
}

// Admin - 管理者
type Admin struct {
	ID        int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	GoogleID  string    `json:"googleId" gorm:"uniqueIndex"`
	Email     string    `json:"email" gorm:"uniqueIndex"`
	Name      string    `json:"name"`
	Avatar    string    `json:"avatar"`
	RoleID    int64     `json:"roleId" gorm:"column:role_id"`
	Role      *Role     `json:"role" gorm:"foreignKey:RoleID"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// IsSuperAdmin - スーパー管理者かどうか
func (a *Admin) IsSuperAdmin() bool {
	return a.Role != nil && a.Role.Name == RoleSuperAdmin
}

// CanManageProducts - 商品管理権限があるか
func (a *Admin) CanManageProducts() bool {
	if a.Role == nil {
		return false
	}
	return a.Role.Name == RoleSuperAdmin || a.Role.Name == RoleAdmin
}

// CanManageReviews - レビュー管理権限があるか
func (a *Admin) CanManageReviews() bool {
	if a.Role == nil {
		return false
	}
	return a.Role.Name == RoleSuperAdmin || a.Role.Name == RoleAdmin || a.Role.Name == RoleModerator
}
