package dto

type SeedlingEvaluationRequest struct {
	ProjectID     int64                       `json:"projectId" binding:"required"`
	PartyID       int64                       `json:"partyId" binding:"required"`
	EvaluationNo  string                      `json:"evaluationNo" binding:"required"`
	BenchmarkDate string                      `json:"benchmarkDate"`
	SurveyDate    string                      `json:"surveyDate"`
	Status        string                      `json:"status" binding:"required"`
	Remark        string                      `json:"remark"`
	Items         []SeedlingEvaluationItemDTO `json:"items" binding:"required"`
}

type SeedlingEvaluationItemDTO struct {
	ID            int64   `json:"id"`
	EvaluationID  int64   `json:"evaluationId"`
	LineNo        int     `json:"lineNo" binding:"required"`
	SeedlingName  string  `json:"seedlingName" binding:"required"`
	Specification string  `json:"specification"`
	Unit          string  `json:"unit"`
	Quantity      float64 `json:"quantity" binding:"required"`
	UnitPrice     float64 `json:"unitPrice" binding:"min=0"`
	Amount        float64 `json:"amount" binding:"min=0"`
	Remark        string  `json:"remark"`
}

type SeedlingEvaluationResponse struct {
	ID            int64                       `json:"id"`
	ProjectID     int64                       `json:"projectId"`
	PartyID       int64                       `json:"partyId"`
	EvaluationNo  string                      `json:"evaluationNo"`
	BenchmarkDate *string                     `json:"benchmarkDate"`
	SurveyDate    *string                     `json:"surveyDate"`
	TotalAmount   float64                     `json:"totalAmount"`
	Status        string                      `json:"status"`
	Remark        string                      `json:"remark"`
	Items         []SeedlingEvaluationItemDTO `json:"items"`
}
