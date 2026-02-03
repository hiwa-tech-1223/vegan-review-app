package adminusecase

import (
	"backend/domain/customer"
	"errors"
	"time"
)

// CustomerWithReviewCount - カスタマーとレビュー数
type CustomerWithReviewCount struct {
	customer.Customer
	ReviewCount int
}

// AdminCustomerUsecase - 管理者向けカスタマーユースケース
type AdminCustomerUsecase struct {
	customerRepo customer.CustomerRepository
}

// NewAdminCustomerUsecase - 管理者向けカスタマーユースケースの生成
func NewAdminCustomerUsecase(customerRepo customer.CustomerRepository) *AdminCustomerUsecase {
	return &AdminCustomerUsecase{customerRepo: customerRepo}
}

// GetAllCustomers - 全カスタマー一覧取得（レビュー数付き）
func (u *AdminCustomerUsecase) GetAllCustomers() ([]CustomerWithReviewCount, error) {
	customers, reviewCounts, err := u.customerRepo.FindAllWithReviewCount()
	if err != nil {
		return nil, err
	}

	result := make([]CustomerWithReviewCount, len(customers))
	for i, c := range customers {
		result[i] = CustomerWithReviewCount{
			Customer:    c,
			ReviewCount: reviewCounts[c.ID],
		}
	}
	return result, nil
}

// BanCustomer - カスタマーをBANする
func (u *AdminCustomerUsecase) BanCustomer(id int64, reason string) (*customer.Customer, error) {
	if reason == "" {
		return nil, errors.New("reason is required")
	}

	c, err := u.customerRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	c.Status = customer.StatusBanned
	c.StatusReason = &reason
	c.SuspendedUntil = nil

	if err := u.customerRepo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

// SuspendCustomer - カスタマーを一時停止する
func (u *AdminCustomerUsecase) SuspendCustomer(id int64, durationDays int, reason string) (*customer.Customer, error) {
	if reason == "" {
		return nil, errors.New("reason is required")
	}
	if durationDays <= 0 {
		return nil, errors.New("duration must be positive")
	}

	c, err := u.customerRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	suspendedUntil := time.Now().AddDate(0, 0, durationDays)
	c.Status = customer.StatusSuspended
	c.StatusReason = &reason
	c.SuspendedUntil = &suspendedUntil

	if err := u.customerRepo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

// UnbanCustomer - カスタマーのBAN/停止を解除する
func (u *AdminCustomerUsecase) UnbanCustomer(id int64) (*customer.Customer, error) {
	c, err := u.customerRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	c.Status = customer.StatusActive
	c.StatusReason = nil
	c.SuspendedUntil = nil

	if err := u.customerRepo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}
