package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type AppendageHandler struct {
	svc *service.AppendageService
}

func NewAppendageHandler(svc *service.AppendageService) *AppendageHandler {
	return &AppendageHandler{svc: svc}
}

func (h *AppendageHandler) List(c *gin.Context) {
	evaluations, err := h.svc.List()
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, evaluations)
}

func (h *AppendageHandler) GetByID(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	evaluation, err := h.svc.GetByID(id)
	if err != nil {
		handleServiceError(c, err, "附属物评估单不存在")
		return
	}
	common.Success(c, evaluation)
}

func (h *AppendageHandler) Create(c *gin.Context) {
	var req dto.AppendageEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	evaluation, err := h.svc.Create(req)
	if err != nil {
		handleServiceError(c, err, "创建失败")
		return
	}
	common.Success(c, evaluation)
}

func (h *AppendageHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.AppendageEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	evaluation, err2 := h.svc.Update(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "附属物评估单不存在")
		return
	}
	common.Success(c, evaluation)
}

func (h *AppendageHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.Delete(id); err != nil {
		handleServiceError(c, err, "附属物评估单不存在")
		return
	}
	common.Success(c, true)
}
