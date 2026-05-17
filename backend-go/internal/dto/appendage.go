package dto

type AppendageEvaluationRequest struct {
	ProjectID    int64                        `json:"projectId" binding:"required"`
	PartyID      int64                        `json:"partyId" binding:"required"`
	EvaluationNo string                       `json:"evaluationNo" binding:"required"`
	TenantName   string                       `json:"tenantName"`
	LocationText string                       `json:"locationText"`
	BenchmarkDate string                      `json:"benchmarkDate"`
	SurveyDate   string                       `json:"surveyDate"`
	Status       string                       `json:"status" binding:"required"`
	Remark       string                       `json:"remark"`
	Items        []AppendageEvaluationItemDTO `json:"items" binding:"required"`
}

type AppendageEvaluationItemDTO struct {
	ID                   int64    `json:"id"`
	EvaluationID         int64    `json:"evaluationId"`
	AssetType            string   `json:"assetType" binding:"required"`
	AssetCode            string   `json:"assetCode"`
	LineNo               int      `json:"lineNo" binding:"required"`
	ItemName             string   `json:"itemName" binding:"required"`
	Specification        string   `json:"specification"`
	Unit                 string   `json:"unit"`
	Quantity             float64  `json:"quantity" binding:"required"`
	ReplacementUnitPrice *float64 `json:"replacementUnitPrice"`
	ReplacementAmount    *float64 `json:"replacementAmount"`
	NoveltyRate          *float64 `json:"noveltyRate"`
	EvaluationUnitPrice  *float64 `json:"evaluationUnitPrice"`
	EvaluationAmount     float64  `json:"evaluationAmount" binding:"min=0"`
	Remark               string   `json:"remark"`
}

type AppendageEvaluationResponse struct {
	ID                  int64                        `json:"id"`
	ProjectID           int64                        `json:"projectId"`
	PartyID             int64                        `json:"partyId"`
	EvaluationNo        string                       `json:"evaluationNo"`
	TenantName          string                       `json:"tenantName"`
	LocationText        string                       `json:"locationText"`
	BenchmarkDate       *string                      `json:"benchmarkDate"`
	SurveyDate          *string                      `json:"surveyDate"`
	StructureAmount     float64                      `json:"structureAmount"`
	EquipmentMoveAmount float64                      `json:"equipmentMoveAmount"`
	SeedlingMoveAmount  float64                      `json:"seedlingMoveAmount"`
	TotalAmount         float64                      `json:"totalAmount"`
	Status              string                       `json:"status"`
	Remark              string                       `json:"remark"`
	Items               []AppendageEvaluationItemDTO `json:"items"`
}
