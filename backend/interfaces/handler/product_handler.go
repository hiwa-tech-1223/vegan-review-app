package handler

import (
	"net/http"
	"strconv"

	"backend/domain/entity"
	"backend/usecase"

	"github.com/labstack/echo/v4"
)

// ProductHandler - 商品ハンドラー
type ProductHandler struct {
	productUsecase *usecase.ProductUsecase
}

// NewProductHandler - 商品ハンドラーの生成
func NewProductHandler(productUsecase *usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{productUsecase: productUsecase}
}

// GetCategories - カテゴリ一覧取得
func (h *ProductHandler) GetCategories(c echo.Context) error {
	categories, err := h.productUsecase.GetAllCategories()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, categories)
}

// GetProducts - 商品一覧取得
func (h *ProductHandler) GetProducts(c echo.Context) error {
	categoryStr := c.QueryParam("category")
	search := c.QueryParam("search")

	var categoryID int64
	if categoryStr != "" {
		var err error
		categoryID, err = strconv.ParseInt(categoryStr, 10, 64)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid category ID"})
		}
	}

	products, err := h.productUsecase.GetAllProducts(categoryID, search)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, products)
}

// GetProduct - 商品詳細取得
func (h *ProductHandler) GetProduct(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	product, err := h.productUsecase.GetProduct(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Product not found"})
	}
	return c.JSON(http.StatusOK, product)
}

// CreateProduct - 商品作成
func (h *ProductHandler) CreateProduct(c echo.Context) error {
	product := new(entity.Product)
	if err := c.Bind(product); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		product.CreatedByAdminID = &userID
	}

	if err := h.productUsecase.CreateProduct(product); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, product)
}

// UpdateProduct - 商品更新
func (h *ProductHandler) UpdateProduct(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	product, err := h.productUsecase.GetProduct(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Product not found"})
	}

	if err := c.Bind(product); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		product.UpdatedByAdminID = &userID
	}

	if err := h.productUsecase.UpdateProduct(product); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, product)
}

// DeleteProduct - 商品削除
func (h *ProductHandler) DeleteProduct(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	if err := h.productUsecase.DeleteProduct(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
