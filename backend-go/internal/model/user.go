package model

import "time"

type SysUser struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"column:username;uniqueIndex;not null" json:"username"`
	PasswordHash string    `gorm:"column:password_hash;not null" json:"-"`
	RealName     string    `gorm:"column:real_name;not null" json:"realName"`
	Phone        string    `gorm:"column:phone" json:"phone"`
	Status       string    `gorm:"column:status;not null;default:ENABLED" json:"status"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	CreatedBy    *int64    `gorm:"column:created_by" json:"createdBy"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	UpdatedBy    *int64    `gorm:"column:updated_by" json:"updatedBy"`
	Deleted      int       `gorm:"column:deleted;not null;default:0" json:"-"`
}

func (SysUser) TableName() string {
	return "sys_user"
}
