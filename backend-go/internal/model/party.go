package model

import "time"

type EvaluationParty struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectID    int64     `gorm:"column:project_id;not null" json:"projectId"`
	PartyType    string    `gorm:"column:party_type;not null" json:"partyType"`
	PartyName    string    `gorm:"column:party_name;not null" json:"partyName"`
	IDNo         string    `gorm:"column:id_no" json:"idNo"`
	ContactPhone string    `gorm:"column:contact_phone" json:"contactPhone"`
	VillageGroup string    `gorm:"column:village_group" json:"villageGroup"`
	TenantName   string    `gorm:"column:tenant_name" json:"tenantName"`
	LocationText string    `gorm:"column:location_text" json:"locationText"`
	Remark       string    `gorm:"column:remark" json:"remark"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy    *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy    *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted      int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (EvaluationParty) TableName() string {
	return "evaluation_party"
}
