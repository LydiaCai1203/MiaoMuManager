package dto

type OptionItemRequest struct {
	GroupCode   string `json:"groupCode" binding:"required"`
	OptionValue string `json:"optionValue" binding:"required"`
	OptionLabel string `json:"optionLabel" binding:"required"`
	SortOrder   int    `json:"sortOrder"`
	Enabled     *bool  `json:"enabled" binding:"required"`
	Remark      string `json:"remark"`
}

type OptionItemResponse struct {
	ID          int64  `json:"id"`
	GroupCode   string `json:"groupCode"`
	OptionValue string `json:"optionValue"`
	OptionLabel string `json:"optionLabel"`
	SortOrder   int    `json:"sortOrder"`
	Enabled     bool   `json:"enabled"`
	Remark      string `json:"remark"`
}
