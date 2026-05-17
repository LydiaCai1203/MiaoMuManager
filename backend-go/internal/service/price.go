package service

import (
	"fmt"
	"time"

	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type PriceService struct {
	db *gorm.DB
}

func NewPriceService(db *gorm.DB) *PriceService {
	return &PriceService{db: db}
}

func (s *PriceService) List() ([]dto.PriceResponse, error) {
	var prices []model.PriceLibrary
	if err := s.db.Where("deleted = 0").Order("id DESC").Find(&prices).Error; err != nil {
		return nil, err
	}

	result := make([]dto.PriceResponse, len(prices))
	for i, p := range prices {
		result[i] = s.toResponse(p)
	}
	return result, nil
}

func (s *PriceService) Lookup(category, name string) ([]dto.PriceResponse, error) {
	today := time.Now().Format("2006-01-02")

	query := s.db.Where("deleted = 0").
		Where("asset_category = ?", category).
		Where("(effective_date IS NULL OR effective_date <= ?)", today).
		Where("(expiry_date IS NULL OR expiry_date >= ?)", today)

	if name != "" {
		query = query.Where("asset_name LIKE ?", "%"+name+"%")
	}

	var prices []model.PriceLibrary
	if err := query.Order("asset_name ASC, specification ASC").Find(&prices).Error; err != nil {
		return nil, err
	}

	result := make([]dto.PriceResponse, len(prices))
	for i, p := range prices {
		result[i] = s.toResponse(p)
	}
	return result, nil
}

func (s *PriceService) Create(req dto.PriceRequest) (*dto.PriceResponse, error) {
	price := model.PriceLibrary{
		AssetCategory: req.AssetCategory,
		AssetName:     req.AssetName,
		Specification: req.Specification,
		Unit:          req.Unit,
		BasePrice:     req.BasePrice,
		EffectiveDate: nullableDate(req.EffectiveDate),
		ExpiryDate:    nullableDate(req.ExpiryDate),
		Remark:        req.Remark,
	}

	if err := s.db.Create(&price).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(price)
	return &resp, nil
}

func (s *PriceService) Update(id int64, req dto.PriceRequest) (*dto.PriceResponse, error) {
	var price model.PriceLibrary
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&price).Error; err != nil {
		return nil, err
	}

	price.AssetCategory = req.AssetCategory
	price.AssetName = req.AssetName
	price.Specification = req.Specification
	price.Unit = req.Unit
	price.BasePrice = req.BasePrice
	price.EffectiveDate = nullableDate(req.EffectiveDate)
	price.ExpiryDate = nullableDate(req.ExpiryDate)
	price.Remark = req.Remark

	if err := s.db.Save(&price).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(price)
	return &resp, nil
}

func (s *PriceService) Delete(id int64) error {
	var price model.PriceLibrary
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&price).Error; err != nil {
		return fmt.Errorf("价格信息不存在: %d", id)
	}
	return s.db.Model(&model.PriceLibrary{}).Where("id = ?", id).Update("deleted", 1).Error
}

func (s *PriceService) toResponse(p model.PriceLibrary) dto.PriceResponse {
	return dto.PriceResponse{
		ID:            p.ID,
		AssetCategory: p.AssetCategory,
		AssetName:     p.AssetName,
		Specification: p.Specification,
		Unit:          p.Unit,
		BasePrice:     p.BasePrice,
		EffectiveDate: p.EffectiveDate,
		ExpiryDate:    p.ExpiryDate,
		Remark:        p.Remark,
	}
}
