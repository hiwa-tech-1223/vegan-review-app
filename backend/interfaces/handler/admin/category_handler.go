package adminhandler

import (
	"net/http"
	"strconv"

	"backend/interfaces/dto"
	adminusecase "backend/usecase/admin"

	"github.com/labstack/echo/v4"
)

// AdminCategoryHandler - 管理者向けカテゴリハンドラー
type AdminCategoryHandler struct {
	adminCategoryUsecase *adminusecase.AdminCategoryUsecase
}

// NewAdminCategoryHandler - 管理者向けカテゴリハンドラーの生成
func NewAdminCategoryHandler(adminCategoryUsecase *adminusecase.AdminCategoryUsecase) *AdminCategoryHandler {
	return &AdminCategoryHandler{adminCategoryUsecase: adminCategoryUsecase}
}

// CreateCategory - カテゴリ作成
func (h *AdminCategoryHandler) CreateCategory(c echo.Context) error {
	var req dto.CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	var adminID *int64
	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		adminID = &userID
	}

	input := adminusecase.CreateCategoryInput{
		Name:             req.Name,
		NameJa:           req.NameJa,
		CreatedByAdminID: adminID,
	}

	category, err := h.adminCategoryUsecase.CreateCategory(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, category)
}

// UpdateCategory - カテゴリ更新
func (h *AdminCategoryHandler) UpdateCategory(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid category ID"})
	}

	var req dto.UpdateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	var adminID *int64
	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userID := c.Get("userId").(int64)
		adminID = &userID
	}

	input := adminusecase.UpdateCategoryInput{
		Name:             req.Name,
		NameJa:           req.NameJa,
		UpdatedByAdminID: adminID,
	}

	category, err := h.adminCategoryUsecase.UpdateCategory(id, input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, category)
}

// DeleteCategory - カテゴリ削除
func (h *AdminCategoryHandler) DeleteCategory(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid category ID"})
	}

	if err := h.adminCategoryUsecase.DeleteCategory(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
