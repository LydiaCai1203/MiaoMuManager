package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type OptionHandler struct {
	svc *service.OptionService
}

func NewOptionHandler(svc *service.OptionService) *OptionHandler {
	return &OptionHandler{svc: svc}
}

func (h *OptionHandler) GetByGroupCode(c *gin.Context) {
	groupCode := c.Param("groupCode")
	items, err := h.svc.GetByGroupCode(groupCode)
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, items)
}

func (h *OptionHandler) ListAll(c *gin.Context) {
	groupCode := c.Query("groupCode")
	items, err := h.svc.ListAll(groupCode)
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, items)
}

func (h *OptionHandler) Create(c *gin.Context) {
	var req dto.OptionItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	item, err := h.svc.Create(req)
	if err != nil {
		handleServiceError(c, err, "创建失败")
		return
	}
	common.Success(c, item)
}

func (h *OptionHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.OptionItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	item, err2 := h.svc.Update(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "选项不存在")
		return
	}
	common.Success(c, item)
}

func (h *OptionHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.Delete(id); err != nil {
		handleServiceError(c, err, "选项不存在")
		return
	}
	common.Success(c, true)
}
