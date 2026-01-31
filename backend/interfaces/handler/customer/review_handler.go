package customerhandler

import (
	"net/http"
	"strconv"

	"backend/domain/valueobject"
	customerusecase "backend/usecase/customer"

	"github.com/labstack/echo/v4"
)

// ReviewHandler - レビューハンドラー
type ReviewHandler struct {
	reviewUsecase *customerusecase.ReviewUsecase
}

// NewReviewHandler - レビューハンドラーの生成
func NewReviewHandler(reviewUsecase *customerusecase.ReviewUsecase) *ReviewHandler {
	return &ReviewHandler{reviewUsecase: reviewUsecase}
}

// GetProductReviews - 商品のレビュー一覧取得
func (h *ReviewHandler) GetProductReviews(c echo.Context) error {
	productIDStr := c.Param("id")
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}

	reviews, err := h.reviewUsecase.GetProductReviews(productID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, reviews)
}

// GetUserReviews - ユーザーのレビュー一覧取得
func (h *ReviewHandler) GetUserReviews(c echo.Context) error {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	reviews, err := h.reviewUsecase.GetUserReviews(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, reviews)
}

// CreateReview - レビュー作成
func (h *ReviewHandler) CreateReview(c echo.Context) error {
	productIDStr := c.Param("id")
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}
	userID := c.Get("userId").(int64)

	var req struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	review, err := h.reviewUsecase.CreateReview(productID, userID, req.Rating, req.Comment)
	if err != nil {
		// バリデーションエラー
		if isValidationError(err) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		if err.Error() == "you have already reviewed this product" {
			return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, review)
}

// DeleteReview - レビュー削除
func (h *ReviewHandler) DeleteReview(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid review ID"})
	}
	userID := c.Get("userId").(int64)
	isAdmin := c.Get("isAdmin").(bool)

	if err := h.reviewUsecase.DeleteReview(id, userID, isAdmin); err != nil {
		switch err.Error() {
		case "review not found":
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		case "permission denied":
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	return c.NoContent(http.StatusNoContent)
}

// UpdateReview - レビュー更新
func (h *ReviewHandler) UpdateReview(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid review ID"})
	}
	userID := c.Get("userId").(int64)

	var req struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	review, err := h.reviewUsecase.UpdateReview(id, userID, req.Rating, req.Comment)
	if err != nil {
		// バリデーションエラー
		if isValidationError(err) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		switch err.Error() {
		case "review not found":
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		case "permission denied":
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	return c.JSON(http.StatusOK, review)
}

// isValidationError - バリデーションエラーかどうかを判定
func isValidationError(err error) bool {
	switch err {
	case valueobject.ErrInvalidRating,
		valueobject.ErrCommentEmpty,
		valueobject.ErrCommentTooShort,
		valueobject.ErrCommentTooLong:
		return true
	}
	return false
}
