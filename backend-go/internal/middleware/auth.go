package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Public routes
		if path == "/api/health" || path == "/api/auth/login" {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			common.Unauthorized(c, "未提供认证信息")
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			common.Unauthorized(c, "认证格式错误")
			c.Abort()
			return
		}

		if token == "" {
			common.Unauthorized(c, "Token 为空")
			c.Abort()
			return
		}

		// Extract username from dev-token-{username}
		username := strings.TrimPrefix(token, "dev-token-")
		if username == token {
			common.Unauthorized(c, "无效的 Token")
			c.Abort()
			return
		}

		c.Set("username", username)
		c.Set("token", token)
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
