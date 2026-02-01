package user

// UserRepository - ユーザーリポジトリインターフェース
type UserRepository interface {
	FindByID(id int64) (*User, error)
	FindByGoogleID(googleID string) (*User, error)
	Create(user *User) error
	Update(user *User) error
}
