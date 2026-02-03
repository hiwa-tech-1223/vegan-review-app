package auth

import (
	"context"
	"encoding/json"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// GoogleUserInfo - Googleから取得するユーザー情報
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// OAuthService - OAuth サービス
type OAuthService struct {
	config      *oauth2.Config
	adminConfig *oauth2.Config
}

// NewOAuthService - OAuthサービスの生成
func NewOAuthService(clientID, clientSecret, redirectURL, adminRedirectURL string) *OAuthService {
	baseConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     google.Endpoint,
	}

	config := *baseConfig
	config.RedirectURL = redirectURL

	adminConfig := *baseConfig
	adminConfig.RedirectURL = adminRedirectURL

	return &OAuthService{
		config:      &config,
		adminConfig: &adminConfig,
	}
}

// GetAuthURL - 認証URL取得
func (s *OAuthService) GetAuthURL(state string) string {
	return s.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// GetAdminAuthURL - 管理者認証URL取得
func (s *OAuthService) GetAdminAuthURL(state string) string {
	return s.adminConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// Exchange - 認可コードをトークンに交換
func (s *OAuthService) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return s.config.Exchange(ctx, code)
}

// ExchangeAdmin - 管理者認可コードをトークンに交換
func (s *OAuthService) ExchangeAdmin(ctx context.Context, code string) (*oauth2.Token, error) {
	return s.adminConfig.Exchange(ctx, code)
}

// GetUserInfo - Googleからユーザー情報を取得
func (s *OAuthService) GetUserInfo(accessToken string) (*GoogleUserInfo, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}
