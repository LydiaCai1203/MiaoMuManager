package model

import "time"

type AppendageEvaluation struct {
	ID                  int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectID           int64     `gorm:"column:project_id;not null" json:"projectId"`
	PartyID             int64     `gorm:"column:party_id;not null" json:"partyId"`
	EvaluationNo        string    `gorm:"column:evaluation_no;uniqueIndex;not null" json:"evaluationNo"`
	TenantName          string    `gorm:"column:tenant_name" json:"tenantName"`
	LocationText        string    `gorm:"column:location_text" json:"locationText"`
	BenchmarkDate       *string   `gorm:"column:benchmark_date;type:date" json:"benchmarkDate"`
	SurveyDate          *string   `gorm:"column:survey_date;type:date" json:"surveyDate"`
	StructureAmount     float64   `gorm:"column:structure_amount;not null;default:0" json:"structureAmount"`
	EquipmentMoveAmount float64   `gorm:"column:equipment_move_amount;not null;default:0" json:"equipmentMoveAmount"`
	SeedlingMoveAmount  float64   `gorm:"column:seedling_move_amount;not null;default:0" json:"seedlingMoveAmount"`
	TotalAmount         float64   `gorm:"column:total_amount;not null;default:0" json:"totalAmount"`
	Status              string    `gorm:"column:status;not null;default:DRAFT" json:"status"`
	Remark              string    `gorm:"column:remark" json:"remark"`
	CreatedAt           time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy           *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt           time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy           *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted             int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (AppendageEvaluation) TableName() string {
	return "appendage_evaluation"
}

type AppendageEvaluationItem struct {
	ID                   int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	EvaluationID         int64    `gorm:"column:evaluation_id;not null" json:"evaluationId"`
	AssetType            string   `gorm:"column:asset_type;not null" json:"assetType"`
	AssetCode            string   `gorm:"column:asset_code" json:"assetCode"`
	LineNo               int      `gorm:"column:line_no;not null" json:"lineNo"`
	ItemName             string   `gorm:"column:item_name;not null" json:"itemName"`
	Specification        string   `gorm:"column:specification" json:"specification"`
	Unit                 string   `gorm:"column:unit" json:"unit"`
	Quantity             float64  `gorm:"column:quantity;not null;default:0" json:"quantity"`
	ReplacementUnitPrice *float64 `gorm:"column:replacement_unit_price" json:"replacementUnitPrice"`
	ReplacementAmount    *float64 `gorm:"column:replacement_amount" json:"replacementAmount"`
	NoveltyRate          *float64 `gorm:"column:novelty_rate" json:"noveltyRate"`
	EvaluationUnitPrice  *float64 `gorm:"column:evaluation_unit_price" json:"evaluationUnitPrice"`
	EvaluationAmount     float64  `gorm:"column:evaluation_amount;not null;default:0" json:"evaluationAmount"`
	Remark               string   `gorm:"column:remark" json:"remark"`
	CreatedAt            time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy            *int64   `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt            time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy            *int64   `gorm:"column:updated_by" json:"updatedBy"`
	Deleted              int      `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (AppendageEvaluationItem) TableName() string {
	return "appendage_evaluation_item"
}
