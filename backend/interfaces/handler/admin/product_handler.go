package adminhandler

import (
	"net/http"
	"strconv"

	"backend/interfaces/dto"
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
	var req dto.CreateProductRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	var adminID *int64
	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		adminID = &userID
	}

	input := adminusecase.CreateProductInput{
		Name:             req.Name,
		NameJa:           req.NameJa,
		Description:      req.Description,
		DescriptionJa:    req.DescriptionJa,
		ImageURL:         req.ImageURL,
		AffiliateURL:     req.AffiliateURL,
		AmazonURL:        req.AmazonURL,
		RakutenURL:       req.RakutenURL,
		YahooURL:         req.YahooURL,
		CategoryIDs:      req.CategoryIDs,
		CreatedByAdminID: adminID,
	}

	product, err := h.adminProductUsecase.CreateProduct(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
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

	var req dto.UpdateProductRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	var adminID *int64
	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		adminID = &userID
	}

	input := adminusecase.UpdateProductInput{
		Name:             req.Name,
		NameJa:           req.NameJa,
		Description:      req.Description,
		DescriptionJa:    req.DescriptionJa,
		ImageURL:         req.ImageURL,
		AffiliateURL:     req.AffiliateURL,
		AmazonURL:        req.AmazonURL,
		RakutenURL:       req.RakutenURL,
		YahooURL:         req.YahooURL,
		CategoryIDs:      req.CategoryIDs,
		UpdatedByAdminID: adminID,
	}

	product, err := h.adminProductUsecase.UpdateProduct(id, input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
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
