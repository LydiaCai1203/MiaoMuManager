package service

import (
	"fmt"
	"strings"

	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type OptionService struct {
	db *gorm.DB
}

func NewOptionService(db *gorm.DB) *OptionService {
	return &OptionService{db: db}
}

func (s *OptionService) GetByGroupCode(groupCode string) ([]dto.OptionItemResponse, error) {
	var items []model.OptionItem
	if err := s.db.Where("group_code = ? AND enabled = 1 AND deleted = 0", strings.ToUpper(groupCode)).
		Order("sort_order ASC, id ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	return s.toResponses(items), nil
}

func (s *OptionService) ListAll(groupCode string) ([]dto.OptionItemResponse, error) {
	query := s.db.Where("deleted = 0")
	if groupCode != "" {
		query = query.Where("group_code = ?", strings.ToUpper(groupCode))
	}

	var items []model.OptionItem
	if err := query.Order("group_code ASC, sort_order ASC, id ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	return s.toResponses(items), nil
}

func (s *OptionService) Create(req dto.OptionItemRequest) (*dto.OptionItemResponse, error) {
	enabled := 1
	if req.Enabled != nil && !*req.Enabled {
		enabled = 0
	}

	item := model.OptionItem{
		GroupCode:   strings.TrimSpace(strings.ToUpper(req.GroupCode)),
		OptionValue: req.OptionValue,
		OptionLabel: req.OptionLabel,
		SortOrder:   req.SortOrder,
		Enabled:     enabled,
		Remark:      req.Remark,
	}

	if err := s.db.Create(&item).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(item)
	return &resp, nil
}

func (s *OptionService) Update(id int64, req dto.OptionItemRequest) (*dto.OptionItemResponse, error) {
	var item model.OptionItem
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&item).Error; err != nil {
		return nil, err
	}

	enabled := 1
	if req.Enabled != nil && !*req.Enabled {
		enabled = 0
	}

	item.GroupCode = strings.TrimSpace(strings.ToUpper(req.GroupCode))
	item.OptionValue = req.OptionValue
	item.OptionLabel = req.OptionLabel
	item.SortOrder = req.SortOrder
	item.Enabled = enabled
	item.Remark = req.Remark

	if err := s.db.Save(&item).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(item)
	return &resp, nil
}

func (s *OptionService) Delete(id int64) error {
	var item model.OptionItem
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&item).Error; err != nil {
		return fmt.Errorf("选项不存在: %d", id)
	}
	return s.db.Model(&model.OptionItem{}).Where("id = ?", id).Update("deleted", 1).Error
}

func (s *OptionService) toResponses(items []model.OptionItem) []dto.OptionItemResponse {
	result := make([]dto.OptionItemResponse, len(items))
	for i, item := range items {
		result[i] = s.toResponse(item)
	}
	return result
}

func (s *OptionService) toResponse(item model.OptionItem) dto.OptionItemResponse {
	return dto.OptionItemResponse{
		ID:          item.ID,
		GroupCode:   item.GroupCode,
		OptionValue: item.OptionValue,
		OptionLabel: item.OptionLabel,
		SortOrder:   item.SortOrder,
		Enabled:     item.Enabled == 1,
		Remark:      item.Remark,
	}
}
