package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Models

// Admin - 管理者（usersとは完全分離）
type Admin struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	GoogleID  string    `json:"googleId" gorm:"uniqueIndex"`
	Email     string    `json:"email" gorm:"uniqueIndex"`
	Name      string    `json:"name"`
	Avatar    string    `json:"avatar"`
	Role      string    `json:"role" gorm:"default:admin"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// User - 一般ユーザー
type User struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	GoogleID    string    `json:"googleId" gorm:"uniqueIndex"`
	Email       string    `json:"email" gorm:"uniqueIndex"`
	Name        string    `json:"name"`
	Avatar      string    `json:"avatar"`
	MemberSince time.Time `json:"memberSince" gorm:"type:date;default:CURRENT_DATE"`
	Phone       *string   `json:"phone"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Category - 商品カテゴリ
type Category struct {
	ID               string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name             string    `json:"name"`
	NameJa           string    `json:"nameJa"`
	Slug             string    `json:"slug" gorm:"uniqueIndex"`
	CreatedByAdminID *string   `json:"createdByAdminId"`
	UpdatedByAdminID *string   `json:"updatedByAdminId"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// Product - 商品
type Product struct {
	ID               string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CategoryID       *string   `json:"categoryId"`
	Category         *Category `json:"category" gorm:"foreignKey:CategoryID"`
	Name             string    `json:"name"`
	NameJa           string    `json:"nameJa"`
	Description      string    `json:"description"`
	DescriptionJa    string    `json:"descriptionJa"`
	ImageURL         string    `json:"imageUrl" gorm:"column:image_url"`
	Price            *float64  `json:"price"`
	StockQuantity    *int      `json:"stockQuantity"`
	IsAvailable      bool      `json:"isAvailable" gorm:"default:true"`
	Rating           float64   `json:"rating" gorm:"default:0"`
	ReviewCount      int       `json:"reviewCount" gorm:"default:0"`
	CreatedByAdminID *string   `json:"createdByAdminId"`
	UpdatedByAdminID *string   `json:"updatedByAdminId"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// Review - レビュー
type Review struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID string    `json:"productId"`
	Product   *Product  `json:"product" gorm:"foreignKey:ProductID"`
	UserID    string    `json:"userId"`
	User      *User     `json:"user" gorm:"foreignKey:UserID"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Favorite - お気に入り
type Favorite struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    string    `json:"userId"`
	User      *User     `json:"user" gorm:"foreignKey:UserID"`
	ProductID string    `json:"productId"`
	Product   *Product  `json:"product" gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"createdAt"`
}

// GoogleUserInfo - Googleから取得するユーザー情報
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// JWTClaims - JWTのペイロード
type JWTClaims struct {
	UserID  string `json:"userId"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
	IsAdmin bool   `json:"isAdmin"`
	Role    string `json:"role,omitempty"`
	jwt.RegisteredClaims
}

var (
	db          *gorm.DB
	oauthConfig *oauth2.Config
	jwtSecret   []byte
	frontendURL string
)

func main() {
	// Load environment variables
	frontendURL = getEnv("FRONTEND_URL", "http://localhost:5173")
	jwtSecret = []byte(getEnv("JWT_SECRET", "default-secret-change-me"))

	// OAuth2 config
	oauthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  getEnv("OAUTH_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     google.Endpoint,
	}

	// Database connection
	dsn := "host=" + getEnv("DB_HOST", "localhost") +
		" user=" + getEnv("DB_USER", "postgres") +
		" password=" + getEnv("DB_PASSWORD", "postgres") +
		" dbname=" + getEnv("DB_NAME", "vegan_review") +
		" port=" + getEnv("DB_PORT", "5432") +
		" sslmode=disable"

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", frontendURL},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Public routes
	e.GET("/api/health", healthCheck)

	// Auth routes (public)
	e.GET("/api/auth/google", handleGoogleLogin)
	e.GET("/api/auth/google/callback", handleGoogleCallback)
	e.GET("/api/auth/admin/google", handleAdminGoogleLogin)
	e.GET("/api/auth/admin/google/callback", handleAdminGoogleCallback)

	// Category routes (public)
	e.GET("/api/categories", getCategories)

	// Product routes (public read)
	e.GET("/api/products", getProducts)
	e.GET("/api/products/:id", getProduct)

	// Review routes (public read)
	e.GET("/api/products/:id/reviews", getProductReviews)

	// Protected routes - require authentication
	auth := e.Group("/api")
	auth.Use(jwtMiddleware)

	// Auth info
	auth.GET("/auth/me", getCurrentUser)
	auth.POST("/auth/logout", handleLogout)

	// Product routes (protected write)
	auth.POST("/products", createProduct)
	auth.PUT("/products/:id", updateProduct)
	auth.DELETE("/products/:id", deleteProduct)

	// Review routes (protected write)
	auth.POST("/products/:id/reviews", createReview)
	auth.DELETE("/reviews/:id", deleteReview)

	// Favorite routes (all protected)
	auth.GET("/users/:id/favorites", getUserFavorites)
	auth.POST("/users/:id/favorites", addFavorite)
	auth.DELETE("/users/:id/favorites/:productId", removeFavorite)

	// User routes (protected)
	auth.GET("/users/:id/reviews", getUserReviews)

	// Start server
	log.Println("Server starting on :8080")
	e.Logger.Fatal(e.Start(":8080"))
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ==================== Auth Handlers ====================

func handleGoogleLogin(c echo.Context) error {
	url := oauthConfig.AuthCodeURL("user-login", oauth2.AccessTypeOffline)
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

func handleGoogleCallback(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=no_code")
	}

	// Exchange code for token
	token, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Token exchange error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=token_exchange")
	}

	// Get user info from Google
	userInfo, err := getGoogleUserInfo(token.AccessToken)
	if err != nil {
		log.Printf("Get user info error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=user_info")
	}

	// Find or create user
	var user User
	result := db.Where("google_id = ?", userInfo.ID).First(&user)
	if result.Error != nil {
		// Create new user
		user = User{
			GoogleID:    userInfo.ID,
			Email:       userInfo.Email,
			Name:        userInfo.Name,
			Avatar:      userInfo.Picture,
			MemberSince: time.Now(),
		}
		db.Create(&user)
	} else {
		// Update existing user info
		user.Name = userInfo.Name
		user.Avatar = userInfo.Picture
		db.Save(&user)
	}

	// Generate JWT
	jwtToken, err := generateJWT(user.ID, user.Email, user.Name, user.Avatar, false, "")
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/login?error=jwt")
	}

	// Redirect to frontend with token
	return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/auth/callback?token="+jwtToken)
}

func handleAdminGoogleLogin(c echo.Context) error {
	// Admin用のリダイレクトURLを設定
	adminConfig := &oauth2.Config{
		ClientID:     oauthConfig.ClientID,
		ClientSecret: oauthConfig.ClientSecret,
		RedirectURL:  getEnv("OAUTH_ADMIN_REDIRECT_URL", "http://localhost:8080/api/auth/admin/google/callback"),
		Scopes:       oauthConfig.Scopes,
		Endpoint:     oauthConfig.Endpoint,
	}
	url := adminConfig.AuthCodeURL("admin-login", oauth2.AccessTypeOffline)
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

func handleAdminGoogleCallback(c echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/login?error=no_code")
	}

	// Admin用のリダイレクトURLを設定
	adminConfig := &oauth2.Config{
		ClientID:     oauthConfig.ClientID,
		ClientSecret: oauthConfig.ClientSecret,
		RedirectURL:  getEnv("OAUTH_ADMIN_REDIRECT_URL", "http://localhost:8080/api/auth/admin/google/callback"),
		Scopes:       oauthConfig.Scopes,
		Endpoint:     oauthConfig.Endpoint,
	}

	// Exchange code for token
	token, err := adminConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Token exchange error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/login?error=token_exchange")
	}

	// Get user info from Google
	userInfo, err := getGoogleUserInfo(token.AccessToken)
	if err != nil {
		log.Printf("Get user info error: %v", err)
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/login?error=user_info")
	}

	// Check if admin exists
	var admin Admin
	result := db.Where("google_id = ? OR email = ?", userInfo.ID, userInfo.Email).First(&admin)
	if result.Error != nil {
		// Admin not found - not authorized
		log.Printf("Admin not found for email: %s", userInfo.Email)
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/login?error=not_admin")
	}

	// Update admin info
	admin.GoogleID = userInfo.ID
	admin.Name = userInfo.Name
	admin.Avatar = userInfo.Picture
	db.Save(&admin)

	// Generate JWT
	jwtToken, err := generateJWT(admin.ID, admin.Email, admin.Name, admin.Avatar, true, admin.Role)
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/login?error=jwt")
	}

	// Redirect to frontend with token
	return c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/admin/auth/callback?token="+jwtToken)
}

func getGoogleUserInfo(accessToken string) (*GoogleUserInfo, error) {
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

func generateJWT(userID, email, name, avatar string, isAdmin bool, role string) (string, error) {
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
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func jwtMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing authorization header"})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid authorization format"})
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token claims"})
		}

		// Set user info in context
		c.Set("userId", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("isAdmin", claims.IsAdmin)
		c.Set("role", claims.Role)

		return next(c)
	}
}

func getCurrentUser(c echo.Context) error {
	userId := c.Get("userId").(string)
	isAdmin := c.Get("isAdmin").(bool)

	if isAdmin {
		var admin Admin
		if err := db.First(&admin, "id = ?", userId).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Admin not found"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"user":    admin,
			"isAdmin": true,
		})
	}

	var user User
	if err := db.First(&user, "id = ?", userId).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"user":    user,
		"isAdmin": false,
	})
}

func handleLogout(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// ==================== Other Handlers ====================

func healthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func getCategories(c echo.Context) error {
	var categories []Category
	db.Find(&categories)
	return c.JSON(http.StatusOK, categories)
}

func getProducts(c echo.Context) error {
	var products []Product
	query := db.Preload("Category")

	if category := c.QueryParam("category"); category != "" && category != "all" {
		query = query.Joins("JOIN categories ON categories.id = products.category_id").
			Where("categories.slug = ?", category)
	}

	if search := c.QueryParam("search"); search != "" {
		query = query.Where("name ILIKE ? OR name_ja ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Order("created_at DESC").Find(&products)
	return c.JSON(http.StatusOK, products)
}

func getProduct(c echo.Context) error {
	id := c.Param("id")
	var product Product
	if err := db.Preload("Category").First(&product, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Product not found"})
	}
	return c.JSON(http.StatusOK, product)
}

func createProduct(c echo.Context) error {
	product := new(Product)
	if err := c.Bind(product); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userId := c.Get("userId").(string)
		product.CreatedByAdminID = &userId
	}

	db.Create(product)
	return c.JSON(http.StatusCreated, product)
}

func updateProduct(c echo.Context) error {
	id := c.Param("id")
	var product Product
	if err := db.First(&product, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Product not found"})
	}

	if err := c.Bind(&product); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if isAdmin := c.Get("isAdmin").(bool); isAdmin {
		userId := c.Get("userId").(string)
		product.UpdatedByAdminID = &userId
	}

	db.Save(&product)
	return c.JSON(http.StatusOK, product)
}

func deleteProduct(c echo.Context) error {
	id := c.Param("id")
	db.Delete(&Product{}, "id = ?", id)
	return c.NoContent(http.StatusNoContent)
}

func getProductReviews(c echo.Context) error {
	productId := c.Param("id")
	var reviews []Review
	db.Preload("User").Where("product_id = ?", productId).Order("created_at DESC").Find(&reviews)
	return c.JSON(http.StatusOK, reviews)
}

func createReview(c echo.Context) error {
	productId := c.Param("id")
	userId := c.Get("userId").(string)

	review := new(Review)
	if err := c.Bind(review); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	review.ProductID = productId
	review.UserID = userId

	var existingReview Review
	if err := db.Where("product_id = ? AND user_id = ?", productId, userId).First(&existingReview).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "You have already reviewed this product"})
	}

	db.Create(review)
	updateProductRating(productId)

	db.Preload("User").First(review, "id = ?", review.ID)

	return c.JSON(http.StatusCreated, review)
}

func deleteReview(c echo.Context) error {
	id := c.Param("id")
	userId := c.Get("userId").(string)
	isAdmin := c.Get("isAdmin").(bool)

	var review Review
	if err := db.First(&review, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Review not found"})
	}

	if review.UserID != userId && !isAdmin {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	productId := review.ProductID
	db.Delete(&review)
	updateProductRating(productId)

	return c.NoContent(http.StatusNoContent)
}

func updateProductRating(productId string) {
	var result struct {
		Avg   float64
		Count int64
	}
	db.Model(&Review{}).Select("AVG(rating) as avg, COUNT(*) as count").
		Where("product_id = ?", productId).Scan(&result)

	db.Model(&Product{}).Where("id = ?", productId).Updates(map[string]interface{}{
		"rating":       result.Avg,
		"review_count": result.Count,
	})
}

func getUserFavorites(c echo.Context) error {
	userId := c.Param("id")
	requestUserId := c.Get("userId").(string)

	if userId != requestUserId {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	var favorites []Favorite
	db.Preload("Product").Preload("Product.Category").Where("user_id = ?", userId).Find(&favorites)
	return c.JSON(http.StatusOK, favorites)
}

func addFavorite(c echo.Context) error {
	userId := c.Param("id")
	requestUserId := c.Get("userId").(string)

	if userId != requestUserId {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	favorite := new(Favorite)
	if err := c.Bind(favorite); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	favorite.UserID = userId

	var existing Favorite
	if err := db.Where("user_id = ? AND product_id = ?", userId, favorite.ProductID).First(&existing).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "Already in favorites"})
	}

	db.Create(favorite)
	return c.JSON(http.StatusCreated, favorite)
}

func removeFavorite(c echo.Context) error {
	userId := c.Param("id")
	productId := c.Param("productId")
	requestUserId := c.Get("userId").(string)

	if userId != requestUserId {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	db.Where("user_id = ? AND product_id = ?", userId, productId).Delete(&Favorite{})
	return c.NoContent(http.StatusNoContent)
}

func getUserReviews(c echo.Context) error {
	userId := c.Param("id")
	var reviews []Review
	db.Preload("Product").Preload("Product.Category").Where("user_id = ?", userId).Order("created_at DESC").Find(&reviews)
	return c.JSON(http.StatusOK, reviews)
}
