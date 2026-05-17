package dto

type ProjectRequest struct {
	ProjectCode     string `json:"projectCode" binding:"required"`
	ProjectName     string `json:"projectName" binding:"required"`
	ProjectType     string `json:"projectType" binding:"required"`
	EntrustingParty string `json:"entrustingParty"`
	RegionName      string `json:"regionName"`
	BenchmarkDate   string `json:"benchmarkDate"`
	SurveyDate      string `json:"surveyDate"`
	Status          string `json:"status" binding:"required"`
	Remark          string `json:"remark"`
}

type ProjectResponse struct {
	ID              int64                `json:"id"`
	ProjectCode     string               `json:"projectCode"`
	ProjectName     string               `json:"projectName"`
	ProjectType     string               `json:"projectType"`
	EntrustingParty string               `json:"entrustingParty"`
	RegionName      string               `json:"regionName"`
	BenchmarkDate   *string              `json:"benchmarkDate"`
	SurveyDate      *string              `json:"surveyDate"`
	Status          string               `json:"status"`
	Remark          string               `json:"remark"`
	Parties         []ProjectPartyResponse `json:"parties"`
}

type ProjectPartyRequest struct {
	PartyType    string `json:"partyType" binding:"required"`
	PartyName    string `json:"partyName" binding:"required"`
	IDNo         string `json:"idNo"`
	ContactPhone string `json:"contactPhone"`
	VillageGroup string `json:"villageGroup"`
	TenantName   string `json:"tenantName"`
	LocationText string `json:"locationText"`
	Remark       string `json:"remark"`
}

type ProjectPartyResponse struct {
	ID           int64  `json:"id"`
	ProjectID    int64  `json:"projectId"`
	PartyType    string `json:"partyType"`
	PartyName    string `json:"partyName"`
	IDNo         string `json:"idNo"`
	ContactPhone string `json:"contactPhone"`
	VillageGroup string `json:"villageGroup"`
	TenantName   string `json:"tenantName"`
	LocationText string `json:"locationText"`
	Remark       string `json:"remark"`
}
