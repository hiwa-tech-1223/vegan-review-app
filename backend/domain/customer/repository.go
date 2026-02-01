package customer

// CustomerRepository - カスタマーリポジトリインターフェース
type CustomerRepository interface {
	FindByID(id int64) (*Customer, error)
	FindByGoogleID(googleID string) (*Customer, error)
	Create(customer *Customer) error
	Update(customer *Customer) error
}
