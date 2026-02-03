package persistence

import (
	"backend/domain/admin"

	"gorm.io/gorm"
)

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
