package main

import (
	"log"
	"net/http"

	"backend/config"
	"backend/infrastructure/auth"
	"backend/infrastructure/persistence"
	"backend/interfaces/handler"
	adminhandler "backend/interfaces/handler/admin"
	customerhandler "backend/interfaces/handler/customer"
	"backend/usecase"
	adminusecase "backend/usecase/admin"
	customerusecase "backend/usecase/customer"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Database connection
	db, err := gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize repositories
	customerRepo := persistence.NewCustomerRepository(db)
	adminRepo := persistence.NewAdminRepository(db)
	productRepo := persistence.NewProductRepository(db)
	categoryRepo := persistence.NewCategoryRepository(db)
	reviewRepo := persistence.NewReviewRepository(db)
	favoriteRepo := persistence.NewFavoriteRepository(db)

	// Initialize services
	jwtService := auth.NewJWTService(cfg.JWTSecret)
	oauthService := auth.NewOAuthService(
		cfg.GoogleClientID,
		cfg.GoogleClientSecret,
		cfg.OAuthRedirectURL,
		cfg.OAuthAdminRedirectURL,
	)

	// Initialize use cases
	authUsecase := usecase.NewAuthUsecase(customerRepo, adminRepo)
	favoriteUsecase := usecase.NewFavoriteUsecase(favoriteRepo)
	adminProductUsecase := adminusecase.NewAdminProductUsecase(productRepo, categoryRepo)
	adminCategoryUsecase := adminusecase.NewAdminCategoryUsecase(categoryRepo)
	adminCustomerUsecase := adminusecase.NewAdminCustomerUsecase(customerRepo)
	adminReviewUsecase := adminusecase.NewAdminReviewUsecase(reviewRepo, productRepo)
	customerProductUsecase := customerusecase.NewProductUsecase(productRepo, categoryRepo)
	customerReviewUsecase := customerusecase.NewReviewUsecase(reviewRepo, productRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUsecase, oauthService, jwtService, cfg.FrontendURL)
	adminProductHandler := adminhandler.NewAdminProductHandler(adminProductUsecase)
	adminCategoryHandler := adminhandler.NewAdminCategoryHandler(adminCategoryUsecase)
	adminCustomerHandler := adminhandler.NewAdminCustomerHandler(adminCustomerUsecase)
	adminReviewHandler := adminhandler.NewAdminReviewHandler(adminReviewUsecase)
	customerProductHandler := customerhandler.NewProductHandler(customerProductUsecase)
	customerReviewHandler := customerhandler.NewReviewHandler(customerReviewUsecase)
	customerFavoriteHandler := customerhandler.NewFavoriteHandler(favoriteUsecase)

	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", cfg.FrontendURL},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Public routes
	e.GET("/api/health", handler.HealthCheck)

	// Auth routes (public)
	e.GET("/api/auth/google", authHandler.HandleGoogleLogin)
	e.GET("/api/auth/google/callback", authHandler.HandleGoogleCallback)
	e.GET("/api/auth/admin/google", authHandler.HandleAdminGoogleLogin)
	e.GET("/api/auth/admin/google/callback", authHandler.HandleAdminGoogleCallback)

	// Category routes (public)
	e.GET("/api/categories", customerProductHandler.GetCategories)

	// Product routes (public read)
	e.GET("/api/products", customerProductHandler.GetProducts)
	e.GET("/api/products/:id", customerProductHandler.GetProduct)

	// Review routes (public read)
	e.GET("/api/products/:id/reviews", customerReviewHandler.GetProductReviews)

	// Protected routes - require authentication
	authGroup := e.Group("/api")
	authGroup.Use(handler.JWTMiddleware(jwtService))

	// Auth info
	authGroup.GET("/auth/me", authHandler.GetMe)
	authGroup.POST("/auth/logout", authHandler.HandleLogout)

	// Product routes (protected write - admin)
	authGroup.POST("/products", adminProductHandler.CreateProduct)
	authGroup.PUT("/products/:id", adminProductHandler.UpdateProduct)
	authGroup.DELETE("/products/:id", adminProductHandler.DeleteProduct)

	// Category routes (protected write - admin)
	authGroup.POST("/categories", adminCategoryHandler.CreateCategory)
	authGroup.PUT("/categories/:id", adminCategoryHandler.UpdateCategory)
	authGroup.DELETE("/categories/:id", adminCategoryHandler.DeleteCategory)

	// Customer routes (admin)
	authGroup.GET("/admin/customers", adminCustomerHandler.GetAllCustomers)
	authGroup.POST("/admin/customers/:id/ban", adminCustomerHandler.BanCustomer)
	authGroup.POST("/admin/customers/:id/suspend", adminCustomerHandler.SuspendCustomer)
	authGroup.POST("/admin/customers/:id/unban", adminCustomerHandler.UnbanCustomer)

	// Review routes (admin)
	authGroup.GET("/reviews", adminReviewHandler.GetAllReviews)

	// Review routes (protected write)
	authGroup.POST("/products/:id/reviews", customerReviewHandler.CreateReview)
	authGroup.PUT("/reviews/:id", customerReviewHandler.UpdateReview)
	authGroup.DELETE("/reviews/:id", customerReviewHandler.DeleteReview)

	// Favorite routes (all protected)
	authGroup.GET("/customers/:id/favorites", customerFavoriteHandler.GetCustomerFavorites)
	authGroup.POST("/customers/:id/favorites", customerFavoriteHandler.AddFavorite)
	authGroup.DELETE("/customers/:id/favorites/:productId", customerFavoriteHandler.RemoveFavorite)

	// Customer routes (protected)
	authGroup.GET("/customers/:id/reviews", customerReviewHandler.GetCustomerReviews)

	// Start server
	log.Println("Server starting on :8080")
	e.Logger.Fatal(e.Start(":8080"))
}
