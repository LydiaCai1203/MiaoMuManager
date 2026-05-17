package dto

type HouseEvaluationRequest struct {
	ProjectID         int64   `json:"projectId" binding:"required"`
	PartyID           int64   `json:"partyId" binding:"required"`
	EvaluationNo      string  `json:"evaluationNo" binding:"required"`
	LocationText      string  `json:"locationText"`
	UsageType         string  `json:"usageType"`
	BuildingArea      float64 `json:"buildingArea" binding:"required"`
	UnitPrice         float64 `json:"unitPrice" binding:"required"`
	RegionFactor      float64 `json:"regionFactor" binding:"required"`
	FloorFactor       float64 `json:"floorFactor" binding:"required"`
	OrientationFactor float64 `json:"orientationFactor" binding:"required"`
	DecorationFactor  float64 `json:"decorationFactor" binding:"required"`
	BenchmarkDate     string  `json:"benchmarkDate"`
	SurveyDate        string  `json:"surveyDate"`
	Status            string  `json:"status" binding:"required"`
	Remark            string  `json:"remark"`
}

type HouseEvaluationResponse struct {
	ID                 int64    `json:"id"`
	ProjectID          int64    `json:"projectId"`
	PartyID            int64    `json:"partyId"`
	EvaluationNo       string   `json:"evaluationNo"`
	LocationText       string   `json:"locationText"`
	UsageType          string   `json:"usageType"`
	BuildingArea       float64  `json:"buildingArea"`
	UnitPrice          float64  `json:"unitPrice"`
	RegionFactor       float64  `json:"regionFactor"`
	FloorFactor        float64  `json:"floorFactor"`
	OrientationFactor  float64  `json:"orientationFactor"`
	DecorationFactor   float64  `json:"decorationFactor"`
	TotalAmount        float64  `json:"totalAmount"`
	SuggestedUnitPrice *float64 `json:"suggestedUnitPrice"`
	PriceAdjusted      int      `json:"priceAdjusted"`
	BenchmarkDate      *string  `json:"benchmarkDate"`
	SurveyDate         *string  `json:"surveyDate"`
	Status             string   `json:"status"`
	Remark             string   `json:"remark"`
}
