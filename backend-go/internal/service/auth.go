package service

import (
	"fmt"

	"github.com/miaomumgr/backend-go/internal/dto"
	"github.com/miaomumgr/backend-go/internal/model"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	token := "dev-token-" + req.Username
	roleCode := "USER"
	if req.Username == "admin" {
		roleCode = "ADMIN"
	}

	// Try to find user in DB for real name
	var user model.SysUser
	realName := req.Username
	if err := s.db.Where("username = ? AND deleted = 0", req.Username).First(&user).Error; err == nil {
		realName = user.RealName
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.AuthUser{
			Username: req.Username,
			RealName: realName,
			RoleCode: roleCode,
		},
	}, nil
}

func (s *AuthService) GetCurrentUser(username string) (*dto.AuthUser, error) {
	roleCode := "USER"
	if username == "admin" {
		roleCode = "ADMIN"
	}

	var user model.SysUser
	realName := username
	if err := s.db.Where("username = ? AND deleted = 0", username).First(&user).Error; err == nil {
		realName = user.RealName
	}

	return &dto.AuthUser{
		Username: username,
		RealName: realName,
		RoleCode: roleCode,
	}, nil
}

func (s *AuthService) ListUsers() ([]dto.UserResponse, error) {
	var users []model.SysUser
	if err := s.db.Where("deleted = 0").Find(&users).Error; err != nil {
		return nil, err
	}

	result := make([]dto.UserResponse, len(users))
	for i, u := range users {
		result[i] = dto.UserResponse{
			ID:       u.ID,
			Username: u.Username,
			RealName: u.RealName,
			Phone:    u.Phone,
			Status:   u.Status,
		}
	}
	return result, nil
}

func (s *AuthService) CreateUser(req dto.UserRequest) (*dto.UserResponse, error) {
	user := model.SysUser{
		Username:     req.Username,
		PasswordHash: "dev-hash",
		RealName:     req.RealName,
		Phone:        req.Phone,
		Status:       req.Status,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		RealName: user.RealName,
		Phone:    user.Phone,
		Status:   user.Status,
	}, nil
}

func (s *AuthService) UpdateUser(id int64, req dto.UserRequest) (*dto.UserResponse, error) {
	var user model.SysUser
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&user).Error; err != nil {
		return nil, err
	}

	user.Username = req.Username
	user.RealName = req.RealName
	user.Phone = req.Phone
	user.Status = req.Status

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		RealName: user.RealName,
		Phone:    user.Phone,
		Status:   user.Status,
	}, nil
}

func (s *AuthService) DeleteUser(id int64) error {
	var user model.SysUser
	if err := s.db.Where("id = ? AND deleted = 0", id).First(&user).Error; err != nil {
		return fmt.Errorf("用户不存在: %d", id)
	}
	return s.db.Model(&model.SysUser{}).Where("id = ?", id).Update("deleted", 1).Error
}
