package service

import (
	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type AppendageService struct {
	db *gorm.DB
}

func NewAppendageService(db *gorm.DB) *AppendageService {
	return &AppendageService{db: db}
}

func (s *AppendageService) List() ([]dto.AppendageEvaluationResponse, error) {
	var evaluations []model.AppendageEvaluation
	if err := s.db.Where("deleted = 0").Order("id DESC").Find(&evaluations).Error; err != nil {
		return nil, err
	}

	if len(evaluations) == 0 {
		return []dto.AppendageEvaluationResponse{}, nil
	}

	// Batch load all items to avoid N+1
	evalIDs := make([]int64, len(evaluations))
	for i, e := range evaluations {
		evalIDs[i] = e.ID
	}

	var allItems []model.AppendageEvaluationItem
	if err := s.db.Where("evaluation_id IN ? AND deleted = 0", evalIDs).
		Order("asset_type ASC, line_no ASC").Find(&allItems).Error; err != nil {
		return nil, err
	}

	itemMap := make(map[int64][]dto.AppendageEvaluationItemDTO)
	for _, item := range allItems {
		itemMap[item.EvaluationID] = append(itemMap[item.EvaluationID], dto.AppendageEvaluationItemDTO{
			ID:                   item.ID,
			EvaluationID:         item.EvaluationID,
			AssetType:            item.AssetType,
			AssetCode:            item.AssetCode,
			LineNo:               item.LineNo,
			ItemName:             item.ItemName,
			Specification:        item.Specification,
			Unit:                 item.Unit,
			Quantity:             item.Quantity,
			ReplacementUnitPrice: item.ReplacementUnitPrice,
			ReplacementAmount:    item.ReplacementAmount,
			NoveltyRate:          item.NoveltyRate,
			EvaluationUnitPrice:  item.EvaluationUnitPrice,
			EvaluationAmount:     item.EvaluationAmount,
			Remark:               item.Remark,
		})
	}

	result := make([]dto.AppendageEvaluationResponse, len(evaluations))
	for i, e := range evaluations {
		items := itemMap[e.ID]
		if items == nil {
			items = []dto.AppendageEvaluationItemDTO{}
		}
		result[i] = s.toResponse(e, items)
	}
	return result, nil
}

func (s *AppendageService) GetByID(id int64) (*dto.AppendageEvaluationResponse, error) {
	var evaluation model.AppendageEvaluation
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

func (s *AppendageService) Create(req dto.AppendageEvaluationRequest) (*dto.AppendageEvaluationResponse, error) {
	if err := ensureProjectExists(s.db, req.ProjectID); err != nil {
		return nil, err
	}
	if err := ensurePartyExists(s.db, req.PartyID); err != nil {
		return nil, err
	}

	structureAmount, equipmentAmount, seedlingAmount := s.calculateAmounts(req.Items)
	totalAmount := structureAmount + equipmentAmount + seedlingAmount

	evaluation := model.AppendageEvaluation{
		ProjectID:           req.ProjectID,
		PartyID:             req.PartyID,
		EvaluationNo:        req.EvaluationNo,
		TenantName:          req.TenantName,
		LocationText:        req.LocationText,
		BenchmarkDate:       nullableDate(req.BenchmarkDate),
		SurveyDate:          nullableDate(req.SurveyDate),
		StructureAmount:     structureAmount,
		EquipmentMoveAmount: equipmentAmount,
		SeedlingMoveAmount:  seedlingAmount,
		TotalAmount:         totalAmount,
		Status:              req.Status,
		Remark:              req.Remark,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&evaluation).Error; err != nil {
			return err
		}

		for _, itemDTO := range req.Items {
			item := model.AppendageEvaluationItem{
				EvaluationID:         evaluation.ID,
				AssetType:            itemDTO.AssetType,
				AssetCode:            itemDTO.AssetCode,
				LineNo:               itemDTO.LineNo,
				ItemName:             itemDTO.ItemName,
				Specification:        itemDTO.Specification,
				Unit:                 itemDTO.Unit,
				Quantity:             itemDTO.Quantity,
				ReplacementUnitPrice: itemDTO.ReplacementUnitPrice,
				ReplacementAmount:    itemDTO.ReplacementAmount,
				NoveltyRate:          itemDTO.NoveltyRate,
				EvaluationUnitPrice:  itemDTO.EvaluationUnitPrice,
				EvaluationAmount:     itemDTO.EvaluationAmount,
				Remark:               itemDTO.Remark,
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

func (s *AppendageService) Update(id int64, req dto.AppendageEvaluationRequest) (*dto.AppendageEvaluationResponse, error) {
	var evaluation model.AppendageEvaluation
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&evaluation).Error; err != nil {
		return nil, err
	}

	structureAmount, equipmentAmount, seedlingAmount := s.calculateAmounts(req.Items)
	totalAmount := structureAmount + equipmentAmount + seedlingAmount

	evaluation.ProjectID = req.ProjectID
	evaluation.PartyID = req.PartyID
	evaluation.EvaluationNo = req.EvaluationNo
	evaluation.TenantName = req.TenantName
	evaluation.LocationText = req.LocationText
	evaluation.BenchmarkDate = nullableDate(req.BenchmarkDate)
	evaluation.SurveyDate = nullableDate(req.SurveyDate)
	evaluation.StructureAmount = structureAmount
	evaluation.EquipmentMoveAmount = equipmentAmount
	evaluation.SeedlingMoveAmount = seedlingAmount
	evaluation.TotalAmount = totalAmount
	evaluation.Status = req.Status
	evaluation.Remark = req.Remark

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&evaluation).Error; err != nil {
			return err
		}

		// Soft-delete old items
		if err := tx.Model(&model.AppendageEvaluationItem{}).
			Where("evaluation_id = ? AND deleted = 0", id).
			Update("deleted", 1).Error; err != nil {
			return err
		}

		// Insert new items
		for _, itemDTO := range req.Items {
			item := model.AppendageEvaluationItem{
				EvaluationID:         evaluation.ID,
				AssetType:            itemDTO.AssetType,
				AssetCode:            itemDTO.AssetCode,
				LineNo:               itemDTO.LineNo,
				ItemName:             itemDTO.ItemName,
				Specification:        itemDTO.Specification,
				Unit:                 itemDTO.Unit,
				Quantity:             itemDTO.Quantity,
				ReplacementUnitPrice: itemDTO.ReplacementUnitPrice,
				ReplacementAmount:    itemDTO.ReplacementAmount,
				NoveltyRate:          itemDTO.NoveltyRate,
				EvaluationUnitPrice:  itemDTO.EvaluationUnitPrice,
				EvaluationAmount:     itemDTO.EvaluationAmount,
				Remark:               itemDTO.Remark,
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

func (s *AppendageService) Delete(id int64) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.AppendageEvaluationItem{}).
			Where("evaluation_id = ?", id).Update("deleted", 1).Error; err != nil {
			return err
		}
		return tx.Model(&model.AppendageEvaluation{}).Where("id = ?", id).Update("deleted", 1).Error
	})
}

func (s *AppendageService) calculateAmounts(items []dto.AppendageEvaluationItemDTO) (structure, equipment, seedling float64) {
	for _, item := range items {
		switch item.AssetType {
		case "STRUCTURE":
			structure += item.EvaluationAmount
		case "EQUIPMENT_MOVE":
			equipment += item.EvaluationAmount
		case "SEEDLING_MOVE":
			seedling += item.EvaluationAmount
		}
	}
	return
}

func (s *AppendageService) getItems(evaluationID int64) ([]dto.AppendageEvaluationItemDTO, error) {
	var items []model.AppendageEvaluationItem
	if err := s.db.Where("evaluation_id = ? AND deleted = 0", evaluationID).
		Order("asset_type ASC, line_no ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	result := make([]dto.AppendageEvaluationItemDTO, len(items))
	for i, item := range items {
		result[i] = dto.AppendageEvaluationItemDTO{
			ID:                   item.ID,
			EvaluationID:         item.EvaluationID,
			AssetType:            item.AssetType,
			AssetCode:            item.AssetCode,
			LineNo:               item.LineNo,
			ItemName:             item.ItemName,
			Specification:        item.Specification,
			Unit:                 item.Unit,
			Quantity:             item.Quantity,
			ReplacementUnitPrice: item.ReplacementUnitPrice,
			ReplacementAmount:    item.ReplacementAmount,
			NoveltyRate:          item.NoveltyRate,
			EvaluationUnitPrice:  item.EvaluationUnitPrice,
			EvaluationAmount:     item.EvaluationAmount,
			Remark:               item.Remark,
		}
	}
	return result, nil
}

func (s *AppendageService) toResponse(e model.AppendageEvaluation, items []dto.AppendageEvaluationItemDTO) dto.AppendageEvaluationResponse {
	if items == nil {
		items = []dto.AppendageEvaluationItemDTO{}
	}
	return dto.AppendageEvaluationResponse{
		ID:                  e.ID,
		ProjectID:           e.ProjectID,
		PartyID:             e.PartyID,
		EvaluationNo:        e.EvaluationNo,
		TenantName:          e.TenantName,
		LocationText:        e.LocationText,
		BenchmarkDate:       e.BenchmarkDate,
		SurveyDate:          e.SurveyDate,
		StructureAmount:     e.StructureAmount,
		EquipmentMoveAmount: e.EquipmentMoveAmount,
		SeedlingMoveAmount:  e.SeedlingMoveAmount,
		TotalAmount:         e.TotalAmount,
		Status:              e.Status,
		Remark:              e.Remark,
		Items:               items,
	}
}
