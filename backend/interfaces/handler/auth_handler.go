package handler

import (
	"context"
	"log"
	"net/http"

	"backend/infrastructure/auth"
	"backend/usecase"

	"github.com/labstack/echo/v4"
)

// AuthHandler - 認証ハンドラー
type AuthHandler struct {
	authUsecase  *usecase.AuthUsecase
	oauthService *auth.OAuthService
	jwtService   *auth.JWTService
	frontendURL  string
}

// NewAuthHandler - 認証ハンドラーの生成
func NewAuthHandler(authUsecase *usecase.AuthUsecase, oauthService *auth.OAuthService, jwtService *auth.JWTService, frontendURL string) *AuthHandler {
	return &AuthHandler{
		authUsecase:  authUsecase,
		oauthService: oauthService,
		jwtService:   jwtService,
		frontendURL:  frontendURL,
	}
}

// HandleGoogleLogin - Googleログイン
func (h *AuthHandler) HandleGoogleLogin(c echo.Context) error {
	url := h.oauthService.GetAuthURL("user-login")
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

// HandleGoogleCallback - Googleコールバック
func (h *AuthHandler) HandleGoogleCallback(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=no_code")
	}

	token, err := h.oauthService.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Token exchange error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=token_exchange")
	}

	userInfo, err := h.oauthService.GetUserInfo(token.AccessToken)
	if err != nil {
		log.Printf("Get user info error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=user_info")
	}

	cust, err := h.authUsecase.FindOrCreateCustomer(userInfo)
	if err != nil {
		log.Printf("Find or create customer error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=user_create")
	}

	jwtToken, err := h.jwtService.GenerateToken(cust.ID, cust.Email, cust.Name, cust.Avatar, false, "")
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=jwt")
	}

	return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/auth/callback?token="+jwtToken)
}

// HandleAdminGoogleLogin - 管理者Googleログイン
func (h *AuthHandler) HandleAdminGoogleLogin(c echo.Context) error {
	url := h.oauthService.GetAdminAuthURL("admin-login")
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

// HandleAdminGoogleCallback - 管理者Googleコールバック
func (h *AuthHandler) HandleAdminGoogleCallback(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=no_code")
	}

	token, err := h.oauthService.ExchangeAdmin(context.Background(), code)
	if err != nil {
		log.Printf("Token exchange error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=token_exchange")
	}

	userInfo, err := h.oauthService.GetUserInfo(token.AccessToken)
	if err != nil {
		log.Printf("Get user info error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=user_info")
	}

	admin, err := h.authUsecase.FindAndUpdateAdmin(userInfo)
	if err != nil {
		log.Printf("Admin not found for email: %s", userInfo.Email)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=not_admin")
	}

	// ロール名を取得（nilの場合はデフォルト値）
	roleName := "admin"
	if admin.Role != nil {
		roleName = admin.Role.Name
	}

	jwtToken, err := h.jwtService.GenerateToken(admin.ID, admin.Email, admin.Name, admin.Avatar, true, roleName)
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=jwt")
	}

	return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/auth/callback?token="+jwtToken)
}

// GetMe - 現在のユーザー取得
func (h *AuthHandler) GetMe(c echo.Context) error {
	userID := c.Get("userId").(int64)
	isAdmin := c.Get("isAdmin").(bool)

	result, err := h.authUsecase.GetCurrentCustomerOrAdmin(userID, isAdmin)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	if isAdmin {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"admin":   result,
			"isAdmin": true,
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"customer": result,
		"isAdmin":  false,
	})
}

// HandleLogout - ログアウト
func (h *AuthHandler) HandleLogout(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}
