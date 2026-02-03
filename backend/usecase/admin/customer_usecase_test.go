package adminusecase

import (
	"backend/domain/customer"
	"errors"
	"testing"
	"time"
)

// mockCustomerRepository - テスト用モックリポジトリ
type mockCustomerRepository struct {
	customers           map[int64]*customer.Customer
	findByIDErr         error
	findAllErr          error
	updateErr           error
	reviewCounts        map[int64]int
	reviewCountsErr     error
}

func strPtr(s string) *string { return &s }

func newMockCustomerRepo() *mockCustomerRepository {
	now := time.Now()
	customers := map[int64]*customer.Customer{
		1: {ID: 1, Name: "Test User 1", Email: "test1@example.com", Status: customer.StatusActive, CreatedAt: now},
		2: {ID: 2, Name: "Test User 2", Email: "test2@example.com", Status: customer.StatusBanned, StatusReason: strPtr("spam"), CreatedAt: now},
	}
	return &mockCustomerRepository{
		customers:    customers,
		reviewCounts: map[int64]int{1: 3, 2: 5},
	}
}

func (m *mockCustomerRepository) FindByID(id int64) (*customer.Customer, error) {
	if m.findByIDErr != nil {
		return nil, m.findByIDErr
	}
	c, ok := m.customers[id]
	if !ok {
		return nil, errors.New("not found")
	}
	copy := *c
	return &copy, nil
}

func (m *mockCustomerRepository) FindByGoogleID(_ string) (*customer.Customer, error) {
	return nil, errors.New("not implemented")
}

func (m *mockCustomerRepository) FindAllWithReviewCount() ([]customer.Customer, map[int64]int, error) {
	if m.findAllErr != nil {
		return nil, nil, m.findAllErr
	}
	if m.reviewCountsErr != nil {
		return nil, nil, m.reviewCountsErr
	}
	var results []customer.Customer
	for _, c := range m.customers {
		results = append(results, *c)
	}
	return results, m.reviewCounts, nil
}

func (m *mockCustomerRepository) Create(c *customer.Customer) error {
	m.customers[c.ID] = c
	return nil
}

func (m *mockCustomerRepository) Update(c *customer.Customer) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	m.customers[c.ID] = c
	return nil
}

func TestGetAllCustomers(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	results, err := uc.GetAllCustomers()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("expected 2 customers, got %d", len(results))
	}
	for _, r := range results {
		if r.ID == 1 && r.ReviewCount != 3 {
			t.Errorf("expected review count 3 for customer 1, got %d", r.ReviewCount)
		}
	}
}

func TestGetAllCustomers_Error(t *testing.T) {
	repo := newMockCustomerRepo()
	repo.findAllErr = errors.New("db error")
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.GetAllCustomers()
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestBanCustomer(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	c, err := uc.BanCustomer(1, "spam")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.Status != customer.StatusBanned {
		t.Errorf("expected status %d, got %d", customer.StatusBanned, c.Status)
	}
	if c.StatusReason == nil || *c.StatusReason != "spam" {
		t.Errorf("expected reason 'spam', got '%v'", c.StatusReason)
	}
	if c.SuspendedUntil != nil {
		t.Error("expected SuspendedUntil to be nil")
	}
}

func TestBanCustomer_EmptyReason(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.BanCustomer(1, "")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestBanCustomer_NotFound(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.BanCustomer(999, "spam")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestBanCustomer_UpdateError(t *testing.T) {
	repo := newMockCustomerRepo()
	repo.updateErr = errors.New("update failed")
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.BanCustomer(1, "spam")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestSuspendCustomer(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	c, err := uc.SuspendCustomer(1, 7, "warning")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.Status != customer.StatusSuspended {
		t.Errorf("expected status %d, got %d", customer.StatusSuspended, c.Status)
	}
	if c.StatusReason == nil || *c.StatusReason != "warning" {
		t.Errorf("expected reason 'warning', got '%v'", c.StatusReason)
	}
	if c.SuspendedUntil == nil {
		t.Fatal("expected SuspendedUntil to be set")
	}
	expectedUntil := time.Now().AddDate(0, 0, 7)
	diff := c.SuspendedUntil.Sub(expectedUntil)
	if diff > time.Minute || diff < -time.Minute {
		t.Errorf("SuspendedUntil is too far from expected: %v", diff)
	}
}

func TestSuspendCustomer_EmptyReason(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.SuspendCustomer(1, 7, "")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestSuspendCustomer_InvalidDuration(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.SuspendCustomer(1, 0, "test")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestSuspendCustomer_NotFound(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.SuspendCustomer(999, 7, "warning")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestUnbanCustomer(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	c, err := uc.UnbanCustomer(2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.Status != customer.StatusActive {
		t.Errorf("expected status %d, got %d", customer.StatusActive, c.Status)
	}
	if c.StatusReason != nil {
		t.Errorf("expected nil reason, got '%v'", c.StatusReason)
	}
	if c.SuspendedUntil != nil {
		t.Error("expected SuspendedUntil to be nil")
	}
}

func TestUnbanCustomer_NotFound(t *testing.T) {
	repo := newMockCustomerRepo()
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.UnbanCustomer(999)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestUnbanCustomer_UpdateError(t *testing.T) {
	repo := newMockCustomerRepo()
	repo.updateErr = errors.New("update failed")
	uc := NewAdminCustomerUsecase(repo)

	_, err := uc.UnbanCustomer(2)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
