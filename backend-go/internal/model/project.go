package model

import "time"

type EvaluationProject struct {
	ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectCode     string    `gorm:"column:project_code;uniqueIndex;not null" json:"projectCode"`
	ProjectName     string    `gorm:"column:project_name;not null" json:"projectName"`
	ProjectType     string    `gorm:"column:project_type;not null" json:"projectType"`
	EntrustingParty string    `gorm:"column:entrusting_party" json:"entrustingParty"`
	RegionName      string    `gorm:"column:region_name" json:"regionName"`
	BenchmarkDate   *string   `gorm:"column:benchmark_date;type:date" json:"benchmarkDate"`
	SurveyDate      *string   `gorm:"column:survey_date;type:date" json:"surveyDate"`
	Status          string    `gorm:"column:status;not null;default:DRAFT" json:"status"`
	Remark          string    `gorm:"column:remark" json:"remark"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy       *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy       *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted         int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (EvaluationProject) TableName() string {
	return "evaluation_project"
}
