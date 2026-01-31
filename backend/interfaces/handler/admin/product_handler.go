package adminhandler

import (
	"net/http"
	"strconv"

	"backend/domain/entity"
	adminusecase "backend/usecase/admin"

	"github.com/labstack/echo/v4"
)

// AdminProductHandler - 管理者向け商品ハンドラー
type AdminProductHandler struct {
	adminProductUsecase *adminusecase.AdminProductUsecase
}

// NewAdminProductHandler - 管理者向け商品ハンドラーの生成
func NewAdminProductHandler(adminProductUsecase *adminusecase.AdminProductUsecase) *AdminProductHandler {
	return &AdminProductHandler{adminProductUsecase: adminProductUsecase}
}

// CreateProduct - 商品作成
func (h *AdminProductHandler) CreateProduct(c echo.Context) error {
	product := new(entity.Product)
	if err := c.Bind(product); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		product.CreatedByAdminID = &userID
	}

	if err := h.adminProductUsecase.CreateProduct(product); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, product)
}

// UpdateProduct - 商品更新
func (h *AdminProductHandler) UpdateProduct(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	product, err := h.adminProductUsecase.GetProduct(id)
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

	if err := h.adminProductUsecase.UpdateProduct(product); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, product)
}

// DeleteProduct - 商品削除
func (h *AdminProductHandler) DeleteProduct(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	if err := h.adminProductUsecase.DeleteProduct(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
