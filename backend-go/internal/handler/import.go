package handler

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/miaomumgr/backend-go/internal/common"
	"github.com/miaomumgr/backend-go/internal/service"
)

type ImportHandler struct {
	svc *service.ImportService
}

func NewImportHandler(svc *service.ImportService) *ImportHandler {
	return &ImportHandler{svc: svc}
}

func (h *ImportHandler) ImportSeedling(c *gin.Context) {
	projectID, partyID, err := h.parseImportParams(c)
	if err != nil {
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		common.BadRequest(c, "请上传文件")
		return
	}

	// Save temp file
	tmpFile, err := os.CreateTemp("", "seedling-*.xlsx")
	if err != nil {
		common.InternalError(c, "创建临时文件失败")
		return
	}
	tmpPath := tmpFile.Name()
	tmpFile.Close() // Close before overwriting
	defer os.Remove(tmpPath)

	if err := c.SaveUploadedFile(file, tmpPath); err != nil {
		common.InternalError(c, "保存上传文件失败")
		return
	}

	result, err := h.svc.ImportSeedling(projectID, partyID, tmpPath)
	if err != nil {
		common.BadRequest(c, err.Error())
		return
	}

	common.Success(c, result)
}

func (h *ImportHandler) ImportAppendage(c *gin.Context) {
	projectID, partyID, err := h.parseImportParams(c)
	if err != nil {
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		common.BadRequest(c, "请上传文件")
		return
	}

	tmpFile, err := os.CreateTemp("", "appendage-*.xlsx")
	if err != nil {
		common.InternalError(c, "创建临时文件失败")
		return
	}
	tmpPath := tmpFile.Name()
	tmpFile.Close() // Close before overwriting
	defer os.Remove(tmpPath)

	if err := c.SaveUploadedFile(file, tmpPath); err != nil {
		common.InternalError(c, "保存上传文件失败")
		return
	}

	result, err := h.svc.ImportAppendage(projectID, partyID, tmpPath)
	if err != nil {
		common.BadRequest(c, err.Error())
		return
	}

	common.Success(c, result)
}

func (h *ImportHandler) DownloadSeedlingTemplate(c *gin.Context) {
	data, filename, err := h.svc.DownloadTemplate("苗木模板.xlsx")
	if err != nil {
		common.NotFound(c, err.Error())
		return
	}

	c.Header("Content-Disposition", "attachment; filename*=UTF-8''"+filename)
	c.Data(http.StatusOK, "application/octet-stream", data)
}

func (h *ImportHandler) DownloadAppendageTemplate(c *gin.Context) {
	data, filename, err := h.svc.DownloadTemplate("附属物评估模板.xlsx")
	if err != nil {
		common.NotFound(c, err.Error())
		return
	}

	c.Header("Content-Disposition", "attachment; filename*=UTF-8''"+filename)
	c.Data(http.StatusOK, "application/octet-stream", data)
}

func (h *ImportHandler) parseImportParams(c *gin.Context) (int64, int64, error) {
	projectIDStr := c.PostForm("projectId")
	partyIDStr := c.PostForm("partyId")

	if projectIDStr == "" || partyIDStr == "" {
		common.BadRequest(c, "projectId 和 partyId 必填")
		return 0, 0, errMissingParams
	}

	projectID, err := strconv.ParseInt(projectIDStr, 10, 64)
	if err != nil {
		common.BadRequest(c, "projectId 无效")
		return 0, 0, err
	}

	partyID, err := strconv.ParseInt(partyIDStr, 10, 64)
	if err != nil {
		common.BadRequest(c, "partyId 无效")
		return 0, 0, err
	}

	return projectID, partyID, nil
}

var errMissingParams = fmt.Errorf("missing params")
