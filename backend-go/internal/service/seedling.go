package service

import (
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type SeedlingService struct {
	db *gorm.DB
}

func NewSeedlingService(db *gorm.DB) *SeedlingService {
	return &SeedlingService{db: db}
}

func (s *SeedlingService) List() ([]dto.SeedlingEvaluationResponse, error) {
	var evaluations []model.SeedlingEvaluation
	if err := s.db.Where("deleted = 0").Order("id DESC").Find(&evaluations).Error; err != nil {
		return nil, err
	}

	if len(evaluations) == 0 {
		return []dto.SeedlingEvaluationResponse{}, nil
	}

	// Batch load all items to avoid N+1
	evalIDs := make([]int64, len(evaluations))
	for i, e := range evaluations {
		evalIDs[i] = e.ID
	}

	var allItems []model.SeedlingEvaluationItem
	if err := s.db.Where("evaluation_id IN ? AND deleted = 0", evalIDs).
		Order("line_no ASC").Find(&allItems).Error; err != nil {
		return nil, err
	}

	itemMap := make(map[int64][]dto.SeedlingEvaluationItemDTO)
	for _, item := range allItems {
		itemMap[item.EvaluationID] = append(itemMap[item.EvaluationID], dto.SeedlingEvaluationItemDTO{
			ID:            item.ID,
			EvaluationID:  item.EvaluationID,
			LineNo:        item.LineNo,
			SeedlingName:  item.SeedlingName,
			Specification: item.Specification,
			Unit:          item.Unit,
			Quantity:      item.Quantity,
			UnitPrice:     item.UnitPrice,
			Amount:        item.Amount,
			Remark:        item.Remark,
		})
	}

	result := make([]dto.SeedlingEvaluationResponse, len(evaluations))
	for i, e := range evaluations {
		items := itemMap[e.ID]
		if items == nil {
			items = []dto.SeedlingEvaluationItemDTO{}
		}
		result[i] = s.toResponse(e, items)
	}
	return result, nil
}

func (s *SeedlingService) GetByID(id int64) (*dto.SeedlingEvaluationResponse, error) {
	var evaluation model.SeedlingEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&evaluation).Error; err != nil {
		return nil, err
	}

	items, err := s.getItems(evaluation.ID)
	if err != nil {
		return nil, err
	}
	resp := s.toResponse(evaluation, items)
	return &resp, nil
}

func (s *SeedlingService) Create(req dto.SeedlingEvaluationRequest) (*dto.SeedlingEvaluationResponse, error) {
	if err := ensureProjectExists(s.db, req.ProjectID); err != nil {
		return nil, err
	}
	if err := ensurePartyExists(s.db, req.PartyID); err != nil {
		return nil, err
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Amount
	}

	evaluation := model.SeedlingEvaluation{
		ProjectID:     req.ProjectID,
		PartyID:       req.PartyID,
		EvaluationNo:  req.EvaluationNo,
		BenchmarkDate: nullableDate(req.BenchmarkDate),
		SurveyDate:    nullableDate(req.SurveyDate),
		TotalAmount:   totalAmount,
		Status:        req.Status,
		Remark:        req.Remark,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&evaluation).Error; err != nil {
			return err
		}

		for _, itemDTO := range req.Items {
			item := model.SeedlingEvaluationItem{
				EvaluationID:  evaluation.ID,
				LineNo:        itemDTO.LineNo,
				SeedlingName:  itemDTO.SeedlingName,
				Specification: itemDTO.Specification,
				Unit:          itemDTO.Unit,
				Quantity:      itemDTO.Quantity,
				UnitPrice:     itemDTO.UnitPrice,
				Amount:        itemDTO.Amount,
				Remark:        itemDTO.Remark,
			}
			if item.Unit == "" {
				item.Unit = "株"
			}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	items, err := s.getItems(evaluation.ID)
	if err != nil {
		return nil, err
	}
	resp := s.toResponse(evaluation, items)
	return &resp, nil
}

func (s *SeedlingService) Update(id int64, req dto.SeedlingEvaluationRequest) (*dto.SeedlingEvaluationResponse, error) {
	var evaluation model.SeedlingEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&evaluation).Error; err != nil {
		return nil, err
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Amount
	}

	evaluation.ProjectID = req.ProjectID
	evaluation.PartyID = req.PartyID
	evaluation.EvaluationNo = req.EvaluationNo
	evaluation.BenchmarkDate = nullableDate(req.BenchmarkDate)
	evaluation.SurveyDate = nullableDate(req.SurveyDate)
	evaluation.TotalAmount = totalAmount
	evaluation.Status = req.Status
	evaluation.Remark = req.Remark

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&evaluation).Error; err != nil {
			return err
		}

		// Soft-delete old items
		if err := tx.Model(&model.SeedlingEvaluationItem{}).
			Where("evaluation_id = ? AND deleted = 0", id).
			Update("deleted", 1).Error; err != nil {
			return err
		}

		// Insert new items
		for _, itemDTO := range req.Items {
			item := model.SeedlingEvaluationItem{
				EvaluationID:  evaluation.ID,
				LineNo:        itemDTO.LineNo,
				SeedlingName:  itemDTO.SeedlingName,
				Specification: itemDTO.Specification,
				Unit:          itemDTO.Unit,
				Quantity:      itemDTO.Quantity,
				UnitPrice:     itemDTO.UnitPrice,
				Amount:        itemDTO.Amount,
				Remark:        itemDTO.Remark,
			}
			if item.Unit == "" {
				item.Unit = "株"
			}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	items, err := s.getItems(evaluation.ID)
	if err != nil {
		return nil, err
	}
	resp := s.toResponse(evaluation, items)
	return &resp, nil
}

func (s *SeedlingService) Delete(id int64) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.SeedlingEvaluationItem{}).
			Where("evaluation_id = ?", id).Update("deleted", 1).Error; err != nil {
			return err
		}
		return tx.Model(&model.SeedlingEvaluation{}).Where("id = ?", id).Update("deleted", 1).Error
	})
}

func (s *SeedlingService) getItems(evaluationID int64) ([]dto.SeedlingEvaluationItemDTO, error) {
	var items []model.SeedlingEvaluationItem
	if err := s.db.Where("evaluation_id = ? AND deleted = 0", evaluationID).
		Order("line_no ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	result := make([]dto.SeedlingEvaluationItemDTO, len(items))
	for i, item := range items {
		result[i] = dto.SeedlingEvaluationItemDTO{
			ID:            item.ID,
			EvaluationID:  item.EvaluationID,
			LineNo:        item.LineNo,
			SeedlingName:  item.SeedlingName,
			Specification: item.Specification,
			Unit:          item.Unit,
			Quantity:      item.Quantity,
			UnitPrice:     item.UnitPrice,
			Amount:        item.Amount,
			Remark:        item.Remark,
		}
	}
	return result, nil
}

func (s *SeedlingService) toResponse(e model.SeedlingEvaluation, items []dto.SeedlingEvaluationItemDTO) dto.SeedlingEvaluationResponse {
	if items == nil {
		items = []dto.SeedlingEvaluationItemDTO{}
	}
	return dto.SeedlingEvaluationResponse{
		ID:            e.ID,
		ProjectID:     e.ProjectID,
		PartyID:       e.PartyID,
		EvaluationNo:  e.EvaluationNo,
		BenchmarkDate: e.BenchmarkDate,
		SurveyDate:    e.SurveyDate,
		TotalAmount:   e.TotalAmount,
		Status:        e.Status,
		Remark:        e.Remark,
		Items:         items,
	}
}
