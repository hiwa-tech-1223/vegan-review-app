package adminusecase

import (
	"backend/domain/product"
	"errors"
	"strings"
	"testing"
)

// mockProductRepository - テスト用モックリポジトリ
type mockProductRepository struct {
	createFn   func(p *product.Product) error
	updateFn   func(p *product.Product) error
	findByIDFn func(id int64) (*product.Product, error)
}

func (m *mockProductRepository) FindAll(categoryID int64, search string) ([]product.Product, error) {
	return nil, nil
}
func (m *mockProductRepository) FindByID(id int64) (*product.Product, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	return &product.Product{ID: id}, nil
}
func (m *mockProductRepository) Create(p *product.Product) error {
	if m.createFn != nil {
		return m.createFn(p)
	}
	return nil
}
func (m *mockProductRepository) Update(p *product.Product) error {
	if m.updateFn != nil {
		return m.updateFn(p)
	}
	return nil
}
func (m *mockProductRepository) Delete(id int64) error {
	return nil
}
func (m *mockProductRepository) UpdateRating(productID int64, rating float64, count int) error {
	return nil
}

// mockCategoryRepository - テスト用モックリポジトリ
type mockCategoryRepository struct {
	findByIDFn func(id int64) (*product.Category, error)
}

func (m *mockCategoryRepository) FindAll() ([]product.Category, error) {
	return nil, nil
}
func (m *mockCategoryRepository) FindByID(id int64) (*product.Category, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(id)
	}
	return &product.Category{ID: id, Name: "Test"}, nil
}
func (m *mockCategoryRepository) Create(category *product.Category) error {
	return nil
}
func (m *mockCategoryRepository) Update(category *product.Category) error {
	return nil
}
func (m *mockCategoryRepository) Delete(id int64) error {
	return nil
}

func validCreateInput() CreateProductInput {
	return CreateProductInput{
		Name:          "Test Product",
		NameJa:        "テスト商品",
		Description:   "A valid product description",
		DescriptionJa: "有効な商品説明です",
		ImageURL:      "https://example.com/image.jpg",
		CategoryIDs:   []int64{1},
	}
}

func TestCreateProduct_Success(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	p, err := uc.CreateProduct(validCreateInput())
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if p.Name != "Test Product" {
		t.Errorf("expected name 'Test Product', got '%s'", p.Name)
	}
}

func TestCreateProduct_EmptyName(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Name = ""

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for empty name")
	}
	if !errors.Is(err, product.ErrProductNameEmpty) {
		t.Errorf("expected ErrProductNameEmpty, got %v", err)
	}
}

func TestCreateProduct_NameNoEnglish(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Name = "テスト商品"

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for name without English")
	}
	if !errors.Is(err, product.ErrMustContainEnglish) {
		t.Errorf("expected ErrMustContainEnglish, got %v", err)
	}
}

func TestCreateProduct_NameJaNoJapanese(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.NameJa = "Test Product"

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for nameJa without Japanese")
	}
	if !errors.Is(err, product.ErrMustContainJapanese) {
		t.Errorf("expected ErrMustContainJapanese, got %v", err)
	}
}

func TestCreateProduct_DescriptionNoEnglish(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Description = "テスト説明文です"

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for description without English")
	}
	if !errors.Is(err, product.ErrMustContainEnglish) {
		t.Errorf("expected ErrMustContainEnglish, got %v", err)
	}
}

func TestCreateProduct_DescriptionJaNoJapanese(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.DescriptionJa = "Test description"

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for descriptionJa without Japanese")
	}
	if !errors.Is(err, product.ErrMustContainJapanese) {
		t.Errorf("expected ErrMustContainJapanese, got %v", err)
	}
}

func TestCreateProduct_NameTooLong(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Name = strings.Repeat("a", 256)

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for long name")
	}
	if !errors.Is(err, product.ErrProductNameTooLong) {
		t.Errorf("expected ErrProductNameTooLong, got %v", err)
	}
}

func TestCreateProduct_EmptyDescription(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Description = ""

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for empty description")
	}
	if !errors.Is(err, product.ErrProductDescriptionEmpty) {
		t.Errorf("expected ErrProductDescriptionEmpty, got %v", err)
	}
}

func TestCreateProduct_DescriptionTooLong(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.Description = strings.Repeat("a", 5001)

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for long description")
	}
	if !errors.Is(err, product.ErrProductDescriptionTooLong) {
		t.Errorf("expected ErrProductDescriptionTooLong, got %v", err)
	}
}

func TestCreateProduct_EmptyImageURL(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.ImageURL = ""

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for empty image URL")
	}
	if !errors.Is(err, product.ErrURLEmpty) {
		t.Errorf("expected ErrURLEmpty, got %v", err)
	}
}

func TestCreateProduct_InvalidImageURL(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.ImageURL = "not-a-url"

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for invalid image URL")
	}
	if !errors.Is(err, product.ErrURLInvalid) {
		t.Errorf("expected ErrURLInvalid, got %v", err)
	}
}

func TestCreateProduct_InvalidOptionalURL(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	badURL := "not-a-url"
	input.AmazonURL = &badURL

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for invalid optional URL")
	}
	if !errors.Is(err, product.ErrURLInvalid) {
		t.Errorf("expected ErrURLInvalid, got %v", err)
	}
}

func TestCreateProduct_NilOptionalURL(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := validCreateInput()
	input.AffiliateURL = nil
	input.AmazonURL = nil

	_, err := uc.CreateProduct(input)
	if err != nil {
		t.Fatalf("expected no error for nil optional URLs, got %v", err)
	}
}

func TestCreateProduct_CategoryNotFound(t *testing.T) {
	catRepo := &mockCategoryRepository{
		findByIDFn: func(id int64) (*product.Category, error) {
			return nil, errors.New("not found")
		},
	}
	uc := NewAdminProductUsecase(&mockProductRepository{}, catRepo)

	input := validCreateInput()
	input.CategoryIDs = []int64{999}

	_, err := uc.CreateProduct(input)
	if err == nil {
		t.Fatal("expected error for non-existent category")
	}
}

func TestUpdateProduct_Success(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := UpdateProductInput{
		Name:          "Updated",
		NameJa:        "更新済み",
		Description:   "Updated description",
		DescriptionJa: "更新された説明",
		ImageURL:      "https://example.com/new.jpg",
		CategoryIDs:   []int64{1},
	}

	p, err := uc.UpdateProduct(1, input)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if p.Name != "Updated" {
		t.Errorf("expected name 'Updated', got '%s'", p.Name)
	}
}

func TestUpdateProduct_ValidationError(t *testing.T) {
	uc := NewAdminProductUsecase(&mockProductRepository{}, &mockCategoryRepository{})

	input := UpdateProductInput{
		Name:          "",
		NameJa:        "テスト",
		Description:   "説明",
		DescriptionJa: "説明",
		ImageURL:      "https://example.com/img.jpg",
	}

	_, err := uc.UpdateProduct(1, input)
	if err == nil {
		t.Fatal("expected validation error")
	}
	if !errors.Is(err, product.ErrProductNameEmpty) {
		t.Errorf("expected ErrProductNameEmpty, got %v", err)
	}
}
