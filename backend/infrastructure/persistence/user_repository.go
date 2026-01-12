package persistence

import (
	"backend/domain/entity"
	"backend/domain/repository"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository - ユーザーリポジトリの生成
func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(id int64) (*entity.User, error) {
	var user entity.User
	if err := r.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByGoogleID(googleID string) (*entity.User, error) {
	var user entity.User
	if err := r.db.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(user *entity.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *entity.User) error {
	return r.db.Save(user).Error
}

// adminRepository
type adminRepository struct {
	db *gorm.DB
}

// NewAdminRepository - 管理者リポジトリの生成
func NewAdminRepository(db *gorm.DB) repository.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) FindByID(id int64) (*entity.Admin, error) {
	var admin entity.Admin
	if err := r.db.First(&admin, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) FindByGoogleIDOrEmail(googleID, email string) (*entity.Admin, error) {
	var admin entity.Admin
	if err := r.db.Where("google_id = ? OR email = ?", googleID, email).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) Update(admin *entity.Admin) error {
	return r.db.Save(admin).Error
}
