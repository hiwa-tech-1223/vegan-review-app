package repository

import "backend/domain/entity"

// UserRepository - ユーザーリポジトリインターフェース
type UserRepository interface {
	FindByID(id int64) (*entity.User, error)
	FindByGoogleID(googleID string) (*entity.User, error)
	Create(user *entity.User) error
	Update(user *entity.User) error
}

// AdminRepository - 管理者リポジトリインターフェース
type AdminRepository interface {
	FindByID(id int64) (*entity.Admin, error)
	FindByGoogleIDOrEmail(googleID, email string) (*entity.Admin, error)
	Update(admin *entity.Admin) error
}
