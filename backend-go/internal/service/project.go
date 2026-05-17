package service

import (
	"fmt"

	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type ProjectService struct {
	db *gorm.DB
}

func NewProjectService(db *gorm.DB) *ProjectService {
	return &ProjectService{db: db}
}

func (s *ProjectService) List() ([]dto.ProjectResponse, error) {
	var projects []model.EvaluationProject
	if err := s.db.Where("deleted = 0").Order("id ASC").Find(&projects).Error; err != nil {
		return nil, err
	}

	if len(projects) == 0 {
		return []dto.ProjectResponse{}, nil
	}

	// Batch load all parties to avoid N+1
	projectIDs := make([]int64, len(projects))
	for i, p := range projects {
		projectIDs[i] = p.ID
	}

	var allParties []model.EvaluationParty
	if err := s.db.Where("project_id IN ? AND deleted = 0", projectIDs).Find(&allParties).Error; err != nil {
		return nil, err
	}

	partyMap := make(map[int64][]dto.ProjectPartyResponse)
	for _, p := range allParties {
		partyMap[p.ProjectID] = append(partyMap[p.ProjectID], s.partyToResponse(p))
	}

	result := make([]dto.ProjectResponse, len(projects))
	for i, p := range projects {
		parties := partyMap[p.ID]
		if parties == nil {
			parties = []dto.ProjectPartyResponse{}
		}
		result[i] = s.toResponse(p, parties)
	}
	return result, nil
}

func (s *ProjectService) GetByID(id int64) (*dto.ProjectResponse, error) {
	var project model.EvaluationProject
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&project).Error; err != nil {
		return nil, err
	}

	parties, err := s.getParties(project.ID)
	if err != nil {
		return nil, err
	}
	resp := s.toResponse(project, parties)
	return &resp, nil
}

func (s *ProjectService) Create(req dto.ProjectRequest) (*dto.ProjectResponse, error) {
	project := model.EvaluationProject{
		ProjectCode:     req.ProjectCode,
		ProjectName:     req.ProjectName,
		ProjectType:     req.ProjectType,
		EntrustingParty: req.EntrustingParty,
		RegionName:      req.RegionName,
		BenchmarkDate:   nullableDate(req.BenchmarkDate),
		SurveyDate:      nullableDate(req.SurveyDate),
		Status:          req.Status,
		Remark:          req.Remark,
	}

	if err := s.db.Create(&project).Error; err != nil {
		return nil, err
	}

	resp := s.toResponse(project, nil)
	return &resp, nil
}

func (s *ProjectService) Update(id int64, req dto.ProjectRequest) (*dto.ProjectResponse, error) {
	var project model.EvaluationProject
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&project).Error; err != nil {
		return nil, err
	}

	project.ProjectCode = req.ProjectCode
	project.ProjectName = req.ProjectName
	project.ProjectType = req.ProjectType
	project.EntrustingParty = req.EntrustingParty
	project.RegionName = req.RegionName
	project.BenchmarkDate = nullableDate(req.BenchmarkDate)
	project.SurveyDate = nullableDate(req.SurveyDate)
	project.Status = req.Status
	project.Remark = req.Remark

	if err := s.db.Save(&project).Error; err != nil {
		return nil, err
	}

	parties, _ := s.getParties(project.ID)
	resp := s.toResponse(project, parties)
	return &resp, nil
}

func (s *ProjectService) Delete(id int64) error {
	var count int64
	s.db.Model(&model.EvaluationProject{}).Where("id = ? AND deleted = 0", id).Count(&count)
	if count == 0 {
		return fmt.Errorf("项目不存在: %d", id)
	}
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Cascade soft-delete parties
		if err := tx.Model(&model.EvaluationParty{}).
			Where("project_id = ? AND deleted = 0", id).
			Update("deleted", 1).Error; err != nil {
			return err
		}
		return tx.Model(&model.EvaluationProject{}).Where("id = ?", id).Update("deleted", 1).Error
	})
}

// Party operations

func (s *ProjectService) ListParties(projectID int64) ([]dto.ProjectPartyResponse, error) {
	return s.getParties(projectID)
}

func (s *ProjectService) CreateParty(projectID int64, req dto.ProjectPartyRequest) (*dto.ProjectPartyResponse, error) {
	if err := ensureProjectExists(s.db, projectID); err != nil {
		return nil, err
	}

	party := model.EvaluationParty{
		ProjectID:    projectID,
		PartyType:    req.PartyType,
		PartyName:    req.PartyName,
		IDNo:         req.IDNo,
		ContactPhone: req.ContactPhone,
		VillageGroup: req.VillageGroup,
		TenantName:   req.TenantName,
		LocationText: req.LocationText,
		Remark:       req.Remark,
	}

	if err := s.db.Create(&party).Error; err != nil {
		return nil, err
	}

	resp := s.partyToResponse(party)
	return &resp, nil
}

func (s *ProjectService) UpdateParty(projectID, partyID int64, req dto.ProjectPartyRequest) (*dto.ProjectPartyResponse, error) {
	var party model.EvaluationParty
	if err := s.db.Where("id = ? AND project_id = ? AND deleted = 0", partyID, projectID).First(&party).Error; err != nil {
		return nil, err
	}

	party.PartyType = req.PartyType
	party.PartyName = req.PartyName
	party.IDNo = req.IDNo
	party.ContactPhone = req.ContactPhone
	party.VillageGroup = req.VillageGroup
	party.TenantName = req.TenantName
	party.LocationText = req.LocationText
	party.Remark = req.Remark

	if err := s.db.Save(&party).Error; err != nil {
		return nil, err
	}

	resp := s.partyToResponse(party)
	return &resp, nil
}

func (s *ProjectService) DeleteParty(projectID, partyID int64) error {
	return s.db.Model(&model.EvaluationParty{}).
		Where("id = ? AND project_id = ?", partyID, projectID).
		Update("deleted", 1).Error
}

func (s *ProjectService) getParties(projectID int64) ([]dto.ProjectPartyResponse, error) {
	var parties []model.EvaluationParty
	if err := s.db.Where("project_id = ? AND deleted = 0", projectID).Find(&parties).Error; err != nil {
		return nil, err
	}

	result := make([]dto.ProjectPartyResponse, len(parties))
	for i, p := range parties {
		result[i] = s.partyToResponse(p)
	}
	return result, nil
}

func (s *ProjectService) toResponse(p model.EvaluationProject, parties []dto.ProjectPartyResponse) dto.ProjectResponse {
	if parties == nil {
		parties = []dto.ProjectPartyResponse{}
	}
	return dto.ProjectResponse{
		ID:              p.ID,
		ProjectCode:     p.ProjectCode,
		ProjectName:     p.ProjectName,
		ProjectType:     p.ProjectType,
		EntrustingParty: p.EntrustingParty,
		RegionName:      p.RegionName,
		BenchmarkDate:   p.BenchmarkDate,
		SurveyDate:      p.SurveyDate,
		Status:          p.Status,
		Remark:          p.Remark,
		Parties:         parties,
	}
}

func (s *ProjectService) partyToResponse(p model.EvaluationParty) dto.ProjectPartyResponse {
	return dto.ProjectPartyResponse{
		ID:           p.ID,
		ProjectID:    p.ProjectID,
		PartyType:    p.PartyType,
		PartyName:    p.PartyName,
		IDNo:         p.IDNo,
		ContactPhone: p.ContactPhone,
		VillageGroup: p.VillageGroup,
		TenantName:   p.TenantName,
		LocationText: p.LocationText,
		Remark:       p.Remark,
	}
}

func nullableDate(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func ensureProjectExists(db *gorm.DB, projectID int64) error {
	var count int64
	db.Model(&model.EvaluationProject{}).Where("id = ? AND deleted = 0", projectID).Count(&count)
	if count == 0 {
		return fmt.Errorf("项目不存在: %d", projectID)
	}
	return nil
}

func ensurePartyExists(db *gorm.DB, partyID int64) error {
	var count int64
	db.Model(&model.EvaluationParty{}).Where("id = ? AND deleted = 0", partyID).Count(&count)
	if count == 0 {
		return fmt.Errorf("被评估对象不存在: %d", partyID)
	}
	return nil
}
