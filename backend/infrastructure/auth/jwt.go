package auth

import (
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims - JWTのペイロード
type JWTClaims struct {
	UserID  int64  `json:"userId"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
	IsAdmin bool   `json:"isAdmin"`
	Role    string `json:"role,omitempty"`
	jwt.RegisteredClaims
}

// JWTService - JWT サービス
type JWTService struct {
	secret []byte
}

// NewJWTService - JWTサービスの生成
func NewJWTService(secret string) *JWTService {
	return &JWTService{secret: []byte(secret)}
}

// GenerateToken - JWTトークン生成
func (s *JWTService) GenerateToken(userID int64, email, name, avatar string, isAdmin bool, role string) (string, error) {
	claims := JWTClaims{
		UserID:  userID,
		Email:   email,
		Name:    name,
		Avatar:  avatar,
		IsAdmin: isAdmin,
		Role:    role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   strconv.FormatInt(userID, 10),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

// ValidateToken - JWTトークン検証
func (s *JWTService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, jwt.ErrInvalidKey
	}

	return claims, nil
}

// GetSecret - シークレット取得（ミドルウェア用）
func (s *JWTService) GetSecret() []byte {
	return s.secret
}
