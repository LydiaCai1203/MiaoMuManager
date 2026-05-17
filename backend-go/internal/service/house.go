package service

import (
	"fmt"
	"time"

	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type HouseService struct {
	db *gorm.DB
}

func NewHouseService(db *gorm.DB) *HouseService {
	return &HouseService{db: db}
}

func (s *HouseService) List() ([]dto.HouseEvaluationResponse, error) {
	var evaluations []model.HouseEvaluation
	if err := s.db.Where("deleted = 0").Order("id DESC").Find(&evaluations).Error; err != nil {
		return nil, err
	}

	result := make([]dto.HouseEvaluationResponse, len(evaluations))
	for i, e := range evaluations {
		result[i] = s.toResponse(e)
	}
	return result, nil
}

func (s *HouseService) GetByID(id int64) (*dto.HouseEvaluationResponse, error) {
	var evaluation model.HouseEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&evaluation).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(evaluation)
	return &resp, nil
}

func (s *HouseService) Create(req dto.HouseEvaluationRequest) (*dto.HouseEvaluationResponse, error) {
	if err := ensureProjectExists(s.db, req.ProjectID); err != nil {
		return nil, err
	}
	if err := ensurePartyExists(s.db, req.PartyID); err != nil {
		return nil, err
	}

	totalAmount := req.BuildingArea * req.UnitPrice * req.RegionFactor * req.FloorFactor * req.OrientationFactor * req.DecorationFactor

	suggestedPrice := s.lookupSuggestedPrice(req.UsageType)
	priceAdjusted := 0
	if suggestedPrice != nil && *suggestedPrice != req.UnitPrice {
		priceAdjusted = 1
	}

	evaluation := model.HouseEvaluation{
		ProjectID:          req.ProjectID,
		PartyID:            req.PartyID,
		EvaluationNo:       req.EvaluationNo,
		LocationText:       req.LocationText,
		UsageType:          req.UsageType,
		BuildingArea:       req.BuildingArea,
		UnitPrice:          req.UnitPrice,
		RegionFactor:       req.RegionFactor,
		FloorFactor:        req.FloorFactor,
		OrientationFactor:  req.OrientationFactor,
		DecorationFactor:   req.DecorationFactor,
		TotalAmount:        totalAmount,
		SuggestedUnitPrice: suggestedPrice,
		PriceAdjusted:      priceAdjusted,
		BenchmarkDate:      nullableDate(req.BenchmarkDate),
		SurveyDate:         nullableDate(req.SurveyDate),
		Status:             req.Status,
		Remark:             req.Remark,
	}

	if err := s.db.Create(&evaluation).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(evaluation)
	return &resp, nil
}

func (s *HouseService) Update(id int64, req dto.HouseEvaluationRequest) (*dto.HouseEvaluationResponse, error) {
	var evaluation model.HouseEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&evaluation).Error; err != nil {
		return nil, err
	}

	totalAmount := req.BuildingArea * req.UnitPrice * req.RegionFactor * req.FloorFactor * req.OrientationFactor * req.DecorationFactor

	suggestedPrice := s.lookupSuggestedPrice(req.UsageType)
	priceAdjusted := 0
	if suggestedPrice != nil && *suggestedPrice != req.UnitPrice {
		priceAdjusted = 1
	}

	evaluation.ProjectID = req.ProjectID
	evaluation.PartyID = req.PartyID
	evaluation.EvaluationNo = req.EvaluationNo
	evaluation.LocationText = req.LocationText
	evaluation.UsageType = req.UsageType
	evaluation.BuildingArea = req.BuildingArea
	evaluation.UnitPrice = req.UnitPrice
	evaluation.RegionFactor = req.RegionFactor
	evaluation.FloorFactor = req.FloorFactor
	evaluation.OrientationFactor = req.OrientationFactor
	evaluation.DecorationFactor = req.DecorationFactor
	evaluation.TotalAmount = totalAmount
	evaluation.SuggestedUnitPrice = suggestedPrice
	evaluation.PriceAdjusted = priceAdjusted
	evaluation.BenchmarkDate = nullableDate(req.BenchmarkDate)
	evaluation.SurveyDate = nullableDate(req.SurveyDate)
	evaluation.Status = req.Status
	evaluation.Remark = req.Remark

	if err := s.db.Save(&evaluation).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(evaluation)
	return &resp, nil
}

func (s *HouseService) Delete(id int64) error {
	var eval model.HouseEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&eval).Error; err != nil {
		return fmt.Errorf("房屋评估单不存在: %d", id)
	}
	return s.db.Model(&model.HouseEvaluation{}).Where("id = ?", id).Update("deleted", 1).Error
}

func (s *HouseService) lookupSuggestedPrice(usageType string) *float64 {
	if usageType == "" {
		return nil
	}

	today := time.Now().Format("2006-01-02")
	var price model.PriceLibrary
	err := s.db.Where("asset_category = ? AND asset_name = ? AND deleted = 0", "HOUSE", usageType).
		Where("(effective_date IS NULL OR effective_date <= ?)", today).
		Where("(expiry_date IS NULL OR expiry_date >= ?)", today).
		First(&price).Error

	if err != nil {
		return nil
	}

	return &price.BasePrice
}

func (s *HouseService) toResponse(e model.HouseEvaluation) dto.HouseEvaluationResponse {
	return dto.HouseEvaluationResponse{
		ID:                 e.ID,
		ProjectID:          e.ProjectID,
		PartyID:            e.PartyID,
		EvaluationNo:       e.EvaluationNo,
		LocationText:       e.LocationText,
		UsageType:          e.UsageType,
		BuildingArea:       e.BuildingArea,
		UnitPrice:          e.UnitPrice,
		RegionFactor:       e.RegionFactor,
		FloorFactor:        e.FloorFactor,
		OrientationFactor:  e.OrientationFactor,
		DecorationFactor:   e.DecorationFactor,
		TotalAmount:        e.TotalAmount,
		SuggestedUnitPrice: e.SuggestedUnitPrice,
		PriceAdjusted:      e.PriceAdjusted,
		BenchmarkDate:      e.BenchmarkDate,
		SurveyDate:         e.SurveyDate,
		Status:             e.Status,
		Remark:             e.Remark,
	}
}
