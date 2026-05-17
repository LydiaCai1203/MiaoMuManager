package model

import "time"

type HouseEvaluation struct {
	ID                 int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectID          int64    `gorm:"column:project_id;not null" json:"projectId"`
	PartyID            int64    `gorm:"column:party_id;not null" json:"partyId"`
	EvaluationNo       string   `gorm:"column:evaluation_no;uniqueIndex;not null" json:"evaluationNo"`
	LocationText       string   `gorm:"column:location_text" json:"locationText"`
	UsageType          string   `gorm:"column:usage_type" json:"usageType"`
	BuildingArea       float64  `gorm:"column:building_area;not null;default:0" json:"buildingArea"`
	UnitPrice          float64  `gorm:"column:unit_price;not null;default:0" json:"unitPrice"`
	RegionFactor       float64  `gorm:"column:region_factor;not null;default:1" json:"regionFactor"`
	FloorFactor        float64  `gorm:"column:floor_factor;not null;default:1" json:"floorFactor"`
	OrientationFactor  float64  `gorm:"column:orientation_factor;not null;default:1" json:"orientationFactor"`
	DecorationFactor   float64  `gorm:"column:decoration_factor;not null;default:1" json:"decorationFactor"`
	TotalAmount        float64  `gorm:"column:total_amount;not null;default:0" json:"totalAmount"`
	SuggestedUnitPrice *float64 `gorm:"column:suggested_unit_price" json:"suggestedUnitPrice"`
	PriceAdjusted      int      `gorm:"column:price_adjusted;not null;default:0" json:"priceAdjusted"`
	BenchmarkDate      *string  `gorm:"column:benchmark_date;type:date" json:"benchmarkDate"`
	SurveyDate         *string  `gorm:"column:survey_date;type:date" json:"surveyDate"`
	Status             string   `gorm:"column:status;not null;default:DRAFT" json:"status"`
	Remark             string   `gorm:"column:remark" json:"remark"`
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy          *int64   `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt          time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy          *int64   `gorm:"column:updated_by" json:"updatedBy"`
	Deleted            int      `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (HouseEvaluation) TableName() string {
	return "house_evaluation"
}
