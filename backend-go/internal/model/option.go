package model

import "time"

type OptionItem struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	GroupCode   string    `gorm:"column:group_code;not null" json:"groupCode"`
	OptionValue string    `gorm:"column:option_value;not null" json:"optionValue"`
	OptionLabel string    `gorm:"column:option_label;not null" json:"optionLabel"`
	SortOrder   int       `gorm:"column:sort_order;not null;default:0" json:"sortOrder"`
	Enabled     int       `gorm:"column:enabled;not null;default:1" json:"enabled"`
	Remark      string    `gorm:"column:remark" json:"remark"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy   *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy   *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted     int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (OptionItem) TableName() string {
	return "option_item"
}
