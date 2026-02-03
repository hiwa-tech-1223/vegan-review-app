package adminhandler

import (
	"net/http"
	"strconv"

	"backend/interfaces/dto"
	adminusecase "backend/usecase/admin"

	"github.com/labstack/echo/v4"
)

// AdminCustomerHandler - 管理者向けカスタマーハンドラー
type AdminCustomerHandler struct {
	adminCustomerUsecase *adminusecase.AdminCustomerUsecase
}

// NewAdminCustomerHandler - 管理者向けカスタマーハンドラーの生成
func NewAdminCustomerHandler(adminCustomerUsecase *adminusecase.AdminCustomerUsecase) *AdminCustomerHandler {
	return &AdminCustomerHandler{adminCustomerUsecase: adminCustomerUsecase}
}

// customerResponse - カスタマーレスポンス
type customerResponse struct {
	ID             int64   `json:"id"`
	Name           string  `json:"name"`
	Email          string  `json:"email"`
	Avatar         string  `json:"avatar"`
	MemberSince    string  `json:"memberSince"`
	Status         int     `json:"status"`
	StatusReason   *string `json:"statusReason,omitempty"`
	SuspendedUntil *string `json:"suspendedUntil,omitempty"`
	ReviewCount    int     `json:"reviewCount"`
}

// GetAllCustomers - 全カスタマー一覧取得
func (h *AdminCustomerHandler) GetAllCustomers(c echo.Context) error {
	customers, err := h.adminCustomerUsecase.GetAllCustomers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	var response []customerResponse
	for _, cust := range customers {
		response = append(response, toCustomerResponse(&cust))
	}

	return c.JSON(http.StatusOK, response)
}

// BanCustomer - カスタマーをBANする
func (h *AdminCustomerHandler) BanCustomer(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}

	var req dto.BanCustomerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	cust, err := h.adminCustomerUsecase.BanCustomer(id, req.Reason)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, toCustomerResponse(&adminusecase.CustomerWithReviewCount{Customer: *cust}))
}

// SuspendCustomer - カスタマーを一時停止する
func (h *AdminCustomerHandler) SuspendCustomer(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}

	var req dto.SuspendCustomerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	cust, err := h.adminCustomerUsecase.SuspendCustomer(id, req.Duration, req.Reason)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, toCustomerResponse(&adminusecase.CustomerWithReviewCount{Customer: *cust}))
}

// UnbanCustomer - カスタマーのBAN/停止を解除する
func (h *AdminCustomerHandler) UnbanCustomer(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid customer ID"})
	}

	cust, err := h.adminCustomerUsecase.UnbanCustomer(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, toCustomerResponse(&adminusecase.CustomerWithReviewCount{Customer: *cust}))
}

func toCustomerResponse(cust *adminusecase.CustomerWithReviewCount) customerResponse {
	resp := customerResponse{
		ID:           cust.ID,
		Name:         cust.Name,
		Email:        cust.Email,
		Avatar:       cust.Avatar,
		MemberSince:  cust.MemberSince.Format("2006-01-02"),
		Status:       cust.Status,
		StatusReason: cust.StatusReason,
		ReviewCount:  cust.ReviewCount,
	}
	if cust.SuspendedUntil != nil {
		s := cust.SuspendedUntil.Format("2006-01-02T15:04:05Z")
		resp.SuspendedUntil = &s
	}
	return resp
}
