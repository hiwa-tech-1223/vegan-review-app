package adminusecase

import (
	"backend/domain/product"
	"errors"
	"strings"
	"testing"
)

// mockCategoryRepoForCategory - カテゴリユースケーステスト用モック
type mockCategoryRepoForCategory struct {
	createFn   func(c *product.Category) error
	updateFn   func(c *product.Category) error
	deleteFn   func(id int64) error
	findByIDFn func(id int64) (*product.Category, error)
}

func (m *mockCategoryRepoForCategory) FindAll() ([]product.Category, error) {
	return nil, nil
}
func (m *mockCategoryRepoForCategory) FindByID(id int64) (*product.Category, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	return &product.Category{ID: id, Name: "Test", NameJa: "テスト"}, nil
}
func (m *mockCategoryRepoForCategory) Create(c *product.Category) error {
	if m.createFn != nil {
		return m.createFn(c)
	}
	return nil
}
func (m *mockCategoryRepoForCategory) Update(c *product.Category) error {
	if m.updateFn != nil {
		return m.updateFn(c)
	}
	return nil
}
func (m *mockCategoryRepoForCategory) Delete(id int64) error {
	if m.deleteFn != nil {
		return m.deleteFn(id)
	}
	return nil
}

func validCreateCategoryInput() CreateCategoryInput {
	return CreateCategoryInput{
		Name:   "Meat Alternatives",
		NameJa: "代替肉",
	}
}

func TestCreateCategory_Success(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	c, err := uc.CreateCategory(validCreateCategoryInput())
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if c.Name != "Meat Alternatives" {
		t.Errorf("expected name 'Meat Alternatives', got '%s'", c.Name)
	}
	if c.NameJa != "代替肉" {
		t.Errorf("expected nameJa '代替肉', got '%s'", c.NameJa)
	}
}

func TestCreateCategory_EmptyName(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := validCreateCategoryInput()
	input.Name = ""

	_, err := uc.CreateCategory(input)
	if err == nil {
		t.Fatal("expected error for empty name")
	}
	if !errors.Is(err, product.ErrCategoryNameEmpty) {
		t.Errorf("expected ErrCategoryNameEmpty, got %v", err)
	}
}

func TestCreateCategory_EmptyNameJa(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := validCreateCategoryInput()
	input.NameJa = ""

	_, err := uc.CreateCategory(input)
	if err == nil {
		t.Fatal("expected error for empty nameJa")
	}
	if !errors.Is(err, product.ErrCategoryNameEmpty) {
		t.Errorf("expected ErrCategoryNameEmpty, got %v", err)
	}
}

func TestCreateCategory_NameTooLong(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := validCreateCategoryInput()
	input.Name = strings.Repeat("a", 101)

	_, err := uc.CreateCategory(input)
	if err == nil {
		t.Fatal("expected error for long name")
	}
	if !errors.Is(err, product.ErrCategoryNameTooLong) {
		t.Errorf("expected ErrCategoryNameTooLong, got %v", err)
	}
}

func TestCreateCategory_NameNoEnglish(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := validCreateCategoryInput()
	input.Name = "代替肉"

	_, err := uc.CreateCategory(input)
	if err == nil {
		t.Fatal("expected error for name without English")
	}
	if !errors.Is(err, product.ErrMustContainEnglish) {
		t.Errorf("expected ErrMustContainEnglish, got %v", err)
	}
}

func TestCreateCategory_NameJaNoJapanese(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := validCreateCategoryInput()
	input.NameJa = "Meat Alternatives"

	_, err := uc.CreateCategory(input)
	if err == nil {
		t.Fatal("expected error for nameJa without Japanese")
	}
	if !errors.Is(err, product.ErrMustContainJapanese) {
		t.Errorf("expected ErrMustContainJapanese, got %v", err)
	}
}

func TestUpdateCategory_Success(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := UpdateCategoryInput{
		Name:   "Updated",
		NameJa: "更新済み",
	}

	c, err := uc.UpdateCategory(1, input)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if c.Name != "Updated" {
		t.Errorf("expected name 'Updated', got '%s'", c.Name)
	}
}

func TestUpdateCategory_NotFound(t *testing.T) {
	repo := &mockCategoryRepoForCategory{
		findByIDFn: func(id int64) (*product.Category, error) {
			return nil, errors.New("not found")
		},
	}
	uc := NewAdminCategoryUsecase(repo)

	input := UpdateCategoryInput{
		Name:   "Updated",
		NameJa: "更新済み",
	}

	_, err := uc.UpdateCategory(999, input)
	if err == nil {
		t.Fatal("expected error for not found category")
	}
}

func TestUpdateCategory_ValidationError(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	input := UpdateCategoryInput{
		Name:   "",
		NameJa: "テスト",
	}

	_, err := uc.UpdateCategory(1, input)
	if err == nil {
		t.Fatal("expected validation error")
	}
	if !errors.Is(err, product.ErrCategoryNameEmpty) {
		t.Errorf("expected ErrCategoryNameEmpty, got %v", err)
	}
}

func TestDeleteCategory_Success(t *testing.T) {
	uc := NewAdminCategoryUsecase(&mockCategoryRepoForCategory{})

	err := uc.DeleteCategory(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeleteCategory_RepoError(t *testing.T) {
	repo := &mockCategoryRepoForCategory{
		deleteFn: func(id int64) error {
			return errors.New("delete failed")
		},
	}
	uc := NewAdminCategoryUsecase(repo)

	err := uc.DeleteCategory(1)
	if err == nil {
		t.Fatal("expected error from repo")
	}
}
