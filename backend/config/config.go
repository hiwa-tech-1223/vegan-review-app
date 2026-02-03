package config

import "os"

// Config - アプリケーション設定
type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// OAuth
	GoogleClientID     string
	GoogleClientSecret string
	OAuthRedirectURL   string
	OAuthAdminRedirectURL string

	// JWT
	JWTSecret string

	// Frontend
	FrontendURL string
}

// Load - 設定を読み込む
func Load() *Config {
	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "veganbite"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		OAuthRedirectURL:   getEnv("OAUTH_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),
		OAuthAdminRedirectURL: getEnv("OAUTH_ADMIN_REDIRECT_URL", "http://localhost:8080/api/auth/admin/google/callback"),

		JWTSecret:   getEnv("JWT_SECRET", "default-secret-change-me"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

// GetDSN - データベース接続文字列を取得
func (c *Config) GetDSN() string {
	return "host=" + c.DBHost +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" port=" + c.DBPort +
		" sslmode=" + c.DBSSLMode
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
