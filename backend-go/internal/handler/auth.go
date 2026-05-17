package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "用户名和密码不能为空")
		return
	}

	resp, err := h.svc.Login(req)
	if err != nil {
		handleServiceError(c, err, "登录失败")
		return
	}

	common.Success(c, resp)
}

func (h *AuthHandler) Me(c *gin.Context) {
	usernameVal, ok := c.Get("username")
	if !ok {
		common.Unauthorized(c, "未登录")
		return
	}
	username, ok := usernameVal.(string)
	if !ok || username == "" {
		common.Unauthorized(c, "无效的用户信息")
		return
	}
	user, err := h.svc.GetCurrentUser(username)
	if err != nil {
		common.InternalError(c, "获取用户信息失败")
		return
	}
	common.Success(c, user)
}

func (h *AuthHandler) ListUsers(c *gin.Context) {
	users, err := h.svc.ListUsers()
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, users)
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
	var req dto.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, err := h.svc.CreateUser(req)
	if err != nil {
		handleServiceError(c, err, "创建用户失败")
		return
	}
	common.Success(c, user)
}

func (h *AuthHandler) UpdateUser(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	user, err2 := h.svc.UpdateUser(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "用户不存在")
		return
	}
	common.Success(c, user)
}

func (h *AuthHandler) DeleteUser(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.DeleteUser(id); err != nil {
		handleServiceError(c, err, "用户不存在")
		return
	}
	common.Success(c, true)
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, common.ApiResponse{
		Code:    0,
		Message: "success",
		Data: gin.H{
			"status":  "UP",
			"service": "backend",
		},
	})
}
