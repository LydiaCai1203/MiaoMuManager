package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/config"
	"github.com/miaomumgr/backend-go/internal/handler"
	"github.com/miaomumgr/backend-go/internal/middleware"
	"github.com/miaomumgr/backend-go/internal/service"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(config.AppConfig.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run schema initialization
	initSchema(db)

	// Initialize services
	authSvc := service.NewAuthService(db)
	projectSvc := service.NewProjectService(db)
	seedlingSvc := service.NewSeedlingService(db)
	houseSvc := service.NewHouseService(db)
	appendageSvc := service.NewAppendageService(db)
	priceSvc := service.NewPriceService(db)
	optionSvc := service.NewOptionService(db)
	importSvc := service.NewImportService(db)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authSvc)
	projectHandler := handler.NewProjectHandler(projectSvc)
	seedlingHandler := handler.NewSeedlingHandler(seedlingSvc)
	houseHandler := handler.NewHouseHandler(houseSvc)
	appendageHandler := handler.NewAppendageHandler(appendageSvc)
	priceHandler := handler.NewPriceHandler(priceSvc)
	optionHandler := handler.NewOptionHandler(optionSvc)
	importHandler := handler.NewImportHandler(importSvc)

	// Setup Gin router
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.AuthMiddleware())

	api := r.Group("/api")
	{
		// Health
		api.GET("/health", handler.HealthCheck)

		// Auth
		api.POST("/auth/login", authHandler.Login)
		api.GET("/auth/me", authHandler.Me)
		api.GET("/auth/users", authHandler.ListUsers)
		api.POST("/auth/users", authHandler.CreateUser)
		api.PUT("/auth/users/:id", authHandler.UpdateUser)
		api.DELETE("/auth/users/:id", authHandler.DeleteUser)

		// Projects
		api.GET("/projects", projectHandler.List)
		api.GET("/projects/:id", projectHandler.GetByID)
		api.POST("/projects", projectHandler.Create)
		api.PUT("/projects/:id", projectHandler.Update)
		api.DELETE("/projects/:id", projectHandler.Delete)

		// Project parties
		api.GET("/projects/:id/parties", projectHandler.ListParties)
		api.POST("/projects/:id/parties", projectHandler.CreateParty)
		api.PUT("/projects/:id/parties/:partyId", projectHandler.UpdateParty)
		api.DELETE("/projects/:id/parties/:partyId", projectHandler.DeleteParty)

		// Seedling evaluations
		api.GET("/seedling-evaluations", seedlingHandler.List)
		api.GET("/seedling-evaluations/:id", seedlingHandler.GetByID)
		api.POST("/seedling-evaluations", seedlingHandler.Create)
		api.PUT("/seedling-evaluations/:id", seedlingHandler.Update)
		api.DELETE("/seedling-evaluations/:id", seedlingHandler.Delete)

		// House evaluations
		api.GET("/house-evaluations", houseHandler.List)
		api.GET("/house-evaluations/:id", houseHandler.GetByID)
		api.POST("/house-evaluations", houseHandler.Create)
		api.PUT("/house-evaluations/:id", houseHandler.Update)
		api.DELETE("/house-evaluations/:id", houseHandler.Delete)

		// Appendage evaluations
		api.GET("/appendage-evaluations", appendageHandler.List)
		api.GET("/appendage-evaluations/:id", appendageHandler.GetByID)
		api.POST("/appendage-evaluations", appendageHandler.Create)
		api.PUT("/appendage-evaluations/:id", appendageHandler.Update)
		api.DELETE("/appendage-evaluations/:id", appendageHandler.Delete)

		// Prices
		api.GET("/prices", priceHandler.List)
		api.GET("/prices/lookup", priceHandler.Lookup)
		api.POST("/prices", priceHandler.Create)
		api.PUT("/prices/:id", priceHandler.Update)
		api.DELETE("/prices/:id", priceHandler.Delete)

		// Options
		api.GET("/options/:groupCode", optionHandler.GetByGroupCode)
		api.GET("/system/options", optionHandler.ListAll)
		api.POST("/system/options", optionHandler.Create)
		api.PUT("/system/options/:id", optionHandler.Update)
		api.DELETE("/system/options/:id", optionHandler.Delete)

		// Import
		api.POST("/import/seedling", importHandler.ImportSeedling)
		api.POST("/import/appendage", importHandler.ImportAppendage)

		// Templates
		api.GET("/templates/seedling", importHandler.DownloadSeedlingTemplate)
		api.GET("/templates/appendage", importHandler.DownloadAppendageTemplate)
	}

	// Start server
	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initSchema(db *gorm.DB) {
	paths := []string{"./config/schema.sql", "/config/schema.sql"}
	for _, path := range paths {
		sql, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		if err := db.Exec(string(sql)).Error; err != nil {
			log.Printf("Warning: schema init error (may be OK if tables exist): %v", err)
		}
		return
	}
	log.Println("Warning: schema.sql not found, skipping schema initialization")
}
