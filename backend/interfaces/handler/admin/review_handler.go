package adminhandler

import (
	"net/http"
	"strconv"

	adminusecase "backend/usecase/admin"

	"github.com/labstack/echo/v4"
)

// AdminReviewHandler - 管理者向けレビューハンドラー
type AdminReviewHandler struct {
	adminReviewUsecase *adminusecase.AdminReviewUsecase
}

// NewAdminReviewHandler - 管理者向けレビューハンドラーの生成
func NewAdminReviewHandler(adminReviewUsecase *adminusecase.AdminReviewUsecase) *AdminReviewHandler {
	return &AdminReviewHandler{adminReviewUsecase: adminReviewUsecase}
}

// GetAllReviews - 全レビュー一覧取得
func (h *AdminReviewHandler) GetAllReviews(c echo.Context) error {
	reviews, err := h.adminReviewUsecase.GetAllReviews()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, reviews)
}

// DeleteReview - レビュー削除
func (h *AdminReviewHandler) DeleteReview(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid review ID"})
	}

	if err := h.adminReviewUsecase.DeleteReview(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
