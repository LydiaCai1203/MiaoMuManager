package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type PriceHandler struct {
	svc *service.PriceService
}

func NewPriceHandler(svc *service.PriceService) *PriceHandler {
	return &PriceHandler{svc: svc}
}

func (h *PriceHandler) List(c *gin.Context) {
	prices, err := h.svc.List()
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, prices)
}

func (h *PriceHandler) Lookup(c *gin.Context) {
	category := c.Query("category")
	name := c.Query("name")

	if category == "" {
		common.BadRequest(c, "category 参数必填")
		return
	}

	prices, err := h.svc.Lookup(category, name)
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, prices)
}

func (h *PriceHandler) Create(c *gin.Context) {
	var req dto.PriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	price, err := h.svc.Create(req)
	if err != nil {
		handleServiceError(c, err, "创建失败")
		return
	}
	common.Success(c, price)
}

func (h *PriceHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.PriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	price, err2 := h.svc.Update(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "价格信息不存在")
		return
	}
	common.Success(c, price)
}

func (h *PriceHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.Delete(id); err != nil {
		handleServiceError(c, err, "价格信息不存在")
		return
	}
	common.Success(c, true)
}
