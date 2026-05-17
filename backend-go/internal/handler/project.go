package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/service"
)

type ProjectHandler struct {
	svc *service.ProjectService
}

func NewProjectHandler(svc *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

func (h *ProjectHandler) List(c *gin.Context) {
	projects, err := h.svc.List()
	if err != nil {
		common.InternalError(c, err.Error())
		return
	}
	common.Success(c, projects)
}

func (h *ProjectHandler) GetByID(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	project, err := h.svc.GetByID(id)
	if err != nil {
		handleServiceError(c, err, "项目不存在")
		return
	}
	common.Success(c, project)
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	project, err := h.svc.Create(req)
	if err != nil {
		handleServiceError(c, err, "创建失败")
		return
	}
	common.Success(c, project)
}

func (h *ProjectHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	project, err2 := h.svc.Update(id, req)
	if err2 != nil {
		handleServiceError(c, err2, "项目不存在")
		return
	}
	common.Success(c, project)
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}

	if err := h.svc.Delete(id); err != nil {
		handleServiceError(c, err, "项目不存在")
		return
	}
	common.Success(c, true)
}

// Party handlers

func (h *ProjectHandler) ListParties(c *gin.Context) {
	projectID, err := parseID(c, "id")
	if err != nil {
		return
	}

	parties, err := h.svc.ListParties(projectID)
	if err != nil {
		handleServiceError(c, err, "项目不存在")
		return
	}
	common.Success(c, parties)
}

func (h *ProjectHandler) CreateParty(c *gin.Context) {
	projectID, err := parseID(c, "id")
	if err != nil {
		return
	}

	var req dto.ProjectPartyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	party, err2 := h.svc.CreateParty(projectID, req)
	if err2 != nil {
		handleServiceError(c, err2, "项目不存在")
		return
	}
	common.Success(c, party)
}

func (h *ProjectHandler) UpdateParty(c *gin.Context) {
	projectID, err := parseID(c, "id")
	if err != nil {
		return
	}
	partyID, err := parseID(c, "partyId")
	if err != nil {
		return
	}

	var req dto.ProjectPartyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.BadRequest(c, "请求参数错误: "+err.Error())
		return
	}

	party, err2 := h.svc.UpdateParty(projectID, partyID, req)
	if err2 != nil {
		handleServiceError(c, err2, "被评估方不存在")
		return
	}
	common.Success(c, party)
}

func (h *ProjectHandler) DeleteParty(c *gin.Context) {
	projectID, err := parseID(c, "id")
	if err != nil {
		return
	}
	partyID, err := parseID(c, "partyId")
	if err != nil {
		return
	}

	if err := h.svc.DeleteParty(projectID, partyID); err != nil {
		handleServiceError(c, err, "被评估方不存在")
		return
	}
	common.Success(c, true)
}
