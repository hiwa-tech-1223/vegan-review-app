package persistence

import (
	"backend/domain/admin"
	"backend/domain/user"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository - ユーザーリポジトリの生成
func NewUserRepository(db *gorm.DB) user.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(id int64) (*user.User, error) {
	var u user.User
	if err := r.db.First(&u, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *userRepository) FindByGoogleID(googleID string) (*user.User, error) {
	var u user.User
	if err := r.db.Where("google_id = ?", googleID).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *userRepository) Create(u *user.User) error {
	return r.db.Create(u).Error
}

func (r *userRepository) Update(u *user.User) error {
	return r.db.Save(u).Error
}

// adminRepository
type adminRepository struct {
	db *gorm.DB
}

// NewAdminRepository - 管理者リポジトリの生成
func NewAdminRepository(db *gorm.DB) admin.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) FindByID(id int64) (*admin.Admin, error) {
	var a admin.Admin
	if err := r.db.Preload("Role").First(&a, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *adminRepository) FindByGoogleIDOrEmail(googleID, email string) (*admin.Admin, error) {
	var a admin.Admin
	if err := r.db.Preload("Role").Where("google_id = ? OR email = ?", googleID, email).First(&a).Error; err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *adminRepository) Update(a *admin.Admin) error {
	return r.db.Save(a).Error
}

// adminRoleRepository
type adminRoleRepository struct {
	db *gorm.DB
}

// NewAdminRoleRepository - 管理者ロールリポジトリの生成
func NewAdminRoleRepository(db *gorm.DB) admin.RoleRepository {
	return &adminRoleRepository{db: db}
}

func (r *adminRoleRepository) FindAll() ([]admin.Role, error) {
	var roles []admin.Role
	if err := r.db.Order("id").Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *adminRoleRepository) FindByID(id int64) (*admin.Role, error) {
	var role admin.Role
	if err := r.db.First(&role, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *adminRoleRepository) FindByName(name string) (*admin.Role, error) {
	var role admin.Role
	if err := r.db.Where("name = ?", name).First(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}
