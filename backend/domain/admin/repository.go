package admin

// AdminRepository - 管理者リポジトリインターフェース
type AdminRepository interface {
	FindByID(id int64) (*Admin, error)
	FindByGoogleIDOrEmail(googleID, email string) (*Admin, error)
	Update(admin *Admin) error
}

// RoleRepository - 管理者ロールリポジトリインターフェース
type RoleRepository interface {
	FindAll() ([]Role, error)
	FindByID(id int64) (*Role, error)
	FindByName(name string) (*Role, error)
}
