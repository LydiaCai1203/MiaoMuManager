package model

import "time"

type SeedlingEvaluation struct {
	ID            int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectID     int64     `gorm:"column:project_id;not null" json:"projectId"`
	PartyID       int64     `gorm:"column:party_id;not null" json:"partyId"`
	EvaluationNo  string    `gorm:"column:evaluation_no;uniqueIndex;not null" json:"evaluationNo"`
	BenchmarkDate *string   `gorm:"column:benchmark_date;type:date" json:"benchmarkDate"`
	SurveyDate    *string   `gorm:"column:survey_date;type:date" json:"surveyDate"`
	TotalAmount   float64   `gorm:"column:total_amount;not null;default:0" json:"totalAmount"`
	Status        string    `gorm:"column:status;not null;default:DRAFT" json:"status"`
	Remark        string    `gorm:"column:remark" json:"remark"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy     *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy     *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted       int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (SeedlingEvaluation) TableName() string {
	return "seedling_evaluation"
}

type SeedlingEvaluationItem struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	EvaluationID int64     `gorm:"column:evaluation_id;not null" json:"evaluationId"`
	LineNo       int       `gorm:"column:line_no;not null" json:"lineNo"`
	SeedlingName string    `gorm:"column:seedling_name;not null" json:"seedlingName"`
	Specification string   `gorm:"column:specification" json:"specification"`
	Unit         string    `gorm:"column:unit;not null;default:株" json:"unit"`
	Quantity     float64   `gorm:"column:quantity;not null;default:0" json:"quantity"`
	UnitPrice    float64   `gorm:"column:unit_price;not null;default:0" json:"unitPrice"`
	Amount       float64   `gorm:"column:amount;not null;default:0" json:"amount"`
	Remark       string    `gorm:"column:remark" json:"remark"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy    *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy    *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted      int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (SeedlingEvaluationItem) TableName() string {
	return "seedling_evaluation_item"
}
