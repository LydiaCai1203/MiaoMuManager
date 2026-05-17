package dto

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string   `json:"token"`
	User  AuthUser `json:"user"`
}

type AuthUser struct {
	Username string `json:"username"`
	RealName string `json:"realName"`
	RoleCode string `json:"roleCode"`
}

type UserRequest struct {
	Username string `json:"username" binding:"required"`
	RealName string `json:"realName" binding:"required"`
	Phone    string `json:"phone"`
	Status   string `json:"status" binding:"required"`
}

type UserResponse struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	RealName string `json:"realName"`
	Phone    string `json:"phone"`
	Status   string `json:"status"`
}
