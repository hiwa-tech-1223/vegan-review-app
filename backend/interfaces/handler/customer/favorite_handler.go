package customerhandler

import (
	"net/http"
	"strconv"

	"backend/domain/favorite"
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

// GetCustomerFavorites - カスタマーのお気に入り一覧取得
func (h *FavoriteHandler) GetCustomerFavorites(c echo.Context) error {
	customerIDStr := c.Param("id")
	customerID, err := strconv.ParseInt(customerIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}
	requestCustomerID := c.Get("userId").(int64)

	favorites, err := h.favoriteUsecase.GetCustomerFavorites(customerID, requestCustomerID)
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
	customerIDStr := c.Param("id")
	customerID, err := strconv.ParseInt(customerIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}
	requestCustomerID := c.Get("userId").(int64)

	fav := new(favorite.Favorite)
	if err := c.Bind(fav); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	fav.CustomerID = customerID

	if err := h.favoriteUsecase.AddFavorite(fav, requestCustomerID); err != nil {
		switch err.Error() {
		case "permission denied":
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		case "already in favorites":
			return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	return c.JSON(http.StatusCreated, fav)
}

// RemoveFavorite - お気に入り削除
func (h *FavoriteHandler) RemoveFavorite(c echo.Context) error {
	customerIDStr := c.Param("id")
	customerID, err := strconv.ParseInt(customerIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}
	productIDStr := c.Param("productId")
	productID, err := strconv.ParseInt(productIDStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid product ID"})
	}
	requestCustomerID := c.Get("userId").(int64)

	if err := h.favoriteUsecase.RemoveFavorite(customerID, productID, requestCustomerID); err != nil {
		if err.Error() == "permission denied" {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
