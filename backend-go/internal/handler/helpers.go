package handler

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"gorm.io/gorm"
)

func parseID(c *gin.Context, param string) (int64, error) {
	idStr := c.Param(param)
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		common.BadRequest(c, "无效的 ID 参数")
		return 0, err
	}
	return id, nil
}

// handleServiceError maps service-layer errors to appropriate HTTP responses.
// Business validation errors (e.g., "项目不存在") → 400
// GORM record not found → 404
// Everything else → 500
func handleServiceError(c *gin.Context, err error, notFoundMsg string) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		common.NotFound(c, notFoundMsg)
		return
	}
	// Business validation errors from services use fmt.Errorf with Chinese messages
	if isBusinessError(err) {
		common.BadRequest(c, err.Error())
		return
	}
	common.InternalError(c, err.Error())
}

func isBusinessError(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "不存在") ||
		strings.Contains(msg, "不能") ||
		strings.Contains(msg, "无效") ||
		strings.Contains(msg, "没有") ||
		strings.Contains(msg, "必填")
}
