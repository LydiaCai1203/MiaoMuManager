package common

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ApiResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, ApiResponse{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func Error(c *gin.Context, httpStatus int, message string) {
	c.JSON(httpStatus, ApiResponse{
		Code:    httpStatus,
		Message: message,
		Data:    nil,
	})
}

func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

func InternalError(c *gin.Context, message string) {
	log.Printf("Internal error: %s", message)
	Error(c, http.StatusInternalServerError, "服务器内部错误")
}
