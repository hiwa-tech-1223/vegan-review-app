package customerhandler

import (
	"net/http"
	"strconv"

	"backend/domain/review"
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

// GetCustomerReviews - カスタマーのレビュー一覧取得
func (h *ReviewHandler) GetCustomerReviews(c echo.Context) error {
	customerIDStr := c.Param("id")
	customerID, err := strconv.ParseInt(customerIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}

	reviews, err := h.reviewUsecase.GetCustomerReviews(customerID)
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
	customerID := c.Get("userId").(int64)

	var req struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	rev, err := h.reviewUsecase.CreateReview(productID, customerID, req.Rating, req.Comment)
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
	return c.JSON(http.StatusCreated, rev)
}

// DeleteReview - レビュー削除
func (h *ReviewHandler) DeleteReview(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid review ID"})
	}
	customerID := c.Get("userId").(int64)
	isAdmin := c.Get("isAdmin").(bool)

	if err := h.reviewUsecase.DeleteReview(id, customerID, isAdmin); err != nil {
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
	customerID := c.Get("userId").(int64)

	var req struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	rev, err := h.reviewUsecase.UpdateReview(id, customerID, req.Rating, req.Comment)
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
	return c.JSON(http.StatusOK, rev)
}

// isValidationError - バリデーションエラーかどうかを判定
func isValidationError(err error) bool {
	switch err {
	case review.ErrInvalidRating,
		review.ErrCommentEmpty,
		review.ErrCommentTooShort,
		review.ErrCommentTooLong:
		return true
	}
	return false
}
