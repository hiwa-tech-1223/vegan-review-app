package customerhandler

import (
	"net/http"
	"strconv"

	customerusecase "backend/usecase/customer"

	"github.com/labstack/echo/v4"
)

// ProductHandler - 利用者向け商品ハンドラー
type ProductHandler struct {
	productUsecase *customerusecase.ProductUsecase
}

// NewProductHandler - 利用者向け商品ハンドラーの生成
func NewProductHandler(productUsecase *customerusecase.ProductUsecase) *ProductHandler {
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
