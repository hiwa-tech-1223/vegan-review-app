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

	user, err := h.authUsecase.FindOrCreateUser(userInfo)
	if err != nil {
		log.Printf("Find or create user error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/login?error=user_create")
	}

	jwtToken, err := h.jwtService.GenerateToken(user.ID, user.Email, user.Name, user.Avatar, false, "")
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

	jwtToken, err := h.jwtService.GenerateToken(admin.ID, admin.Email, admin.Name, admin.Avatar, true, admin.Role)
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/login?error=jwt")
	}

	return c.Redirect(http.StatusTemporaryRedirect, h.frontendURL+"/admin/auth/callback?token="+jwtToken)
}

// GetCurrentUser - 現在のユーザー取得
func (h *AuthHandler) GetCurrentUser(c echo.Context) error {
	userID := c.Get("userId").(int64)
	isAdmin := c.Get("isAdmin").(bool)

	user, err := h.authUsecase.GetCurrentUser(userID, isAdmin)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user":    user,
		"isAdmin": isAdmin,
	})
}

// HandleLogout - ログアウト
func (h *AuthHandler) HandleLogout(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}
