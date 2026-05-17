package model

import "time"

type PriceLibrary struct {
	ID            int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	AssetCategory string    `gorm:"column:asset_category;not null" json:"assetCategory"`
	AssetName     string    `gorm:"column:asset_name;not null" json:"assetName"`
	Specification string    `gorm:"column:specification" json:"specification"`
	Unit          string    `gorm:"column:unit" json:"unit"`
	BasePrice     float64   `gorm:"column:base_price;not null" json:"basePrice"`
	EffectiveDate *string   `gorm:"column:effective_date;type:date" json:"effectiveDate"`
	ExpiryDate    *string   `gorm:"column:expiry_date;type:date" json:"expiryDate"`
	Remark        string    `gorm:"column:remark" json:"remark"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy     *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy     *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted       int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (PriceLibrary) TableName() string {
	return "price_library"
}
