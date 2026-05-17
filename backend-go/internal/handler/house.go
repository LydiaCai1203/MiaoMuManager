package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type HouseHandler struct {
	svc *service.HouseService
}

func NewHouseHandler(svc *service.HouseService) *HouseHandler {
	return &HouseHandler{svc: svc}
}

func (h *HouseHandler) List(c *gin.Context) {
	evaluations, err := h.svc.List()
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, evaluations)
}

func (h *HouseHandler) GetByID(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	evaluation, err := h.svc.GetByID(id)
	if err != nil {
		handleServiceError(c, err, "房屋评估单不存在")
		return
	}
	common.Success(c, evaluation)
}

func (h *HouseHandler) Create(c *gin.Context) {
	var req dto.HouseEvaluationRequest
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

func (h *HouseHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.HouseEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	evaluation, err2 := h.svc.Update(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "房屋评估单不存在")
		return
	}
	common.Success(c, evaluation)
}

func (h *HouseHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.Delete(id); err != nil {
		handleServiceError(c, err, "房屋评估单不存在")
		return
	}
	common.Success(c, true)
}
