package handler

import (
	"net/http"
	"strconv"

	"backend/domain/entity"
	"backend/usecase"

	"github.com/labstack/echo/v4"
)

// FavoriteHandler - お気に入りハンドラー
type FavoriteHandler struct {
	favoriteUsecase *usecase.FavoriteUsecase
}

// NewFavoriteHandler - お気に入りハンドラーの生成
func NewFavoriteHandler(favoriteUsecase *usecase.FavoriteUsecase) *FavoriteHandler {
	return &FavoriteHandler{favoriteUsecase: favoriteUsecase}
}

// GetUserFavorites - ユーザーのお気に入り一覧取得
func (h *FavoriteHandler) GetUserFavorites(c echo.Context) error {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}
	requestUserID := c.Get("userId").(int64)

	favorites, err := h.favoriteUsecase.GetUserFavorites(userID, requestUserID)
	if err != nil {
		if err.Error() == "permission denied" {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, favorites)
}

// AddFavorite - お気に入り追加
func (h *FavoriteHandler) AddFavorite(c echo.Context) error {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}
	requestUserID := c.Get("userId").(int64)

	favorite := new(entity.Favorite)
	if err := c.Bind(favorite); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	favorite.UserID = userID

	if err := h.favoriteUsecase.AddFavorite(favorite, requestUserID); err != nil {
		switch err.Error() {
		case "permission denied":
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		case "already in favorites":
			return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	return c.JSON(http.StatusCreated, favorite)
}

// RemoveFavorite - お気に入り削除
func (h *FavoriteHandler) RemoveFavorite(c echo.Context) error {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}
	productIDStr := c.Param("productId")
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}
	requestUserID := c.Get("userId").(int64)

	if err := h.favoriteUsecase.RemoveFavorite(userID, productID, requestUserID); err != nil {
		if err.Error() == "permission denied" {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
