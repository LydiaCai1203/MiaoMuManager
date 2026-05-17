package dto

type PriceRequest struct {
	AssetCategory string  `json:"assetCategory" binding:"required"`
	AssetName     string  `json:"assetName" binding:"required"`
	Specification string  `json:"specification"`
	Unit          string  `json:"unit"`
	BasePrice     float64 `json:"basePrice" binding:"required"`
	EffectiveDate string  `json:"effectiveDate"`
	ExpiryDate    string  `json:"expiryDate"`
	Remark        string  `json:"remark"`
}

type PriceResponse struct {
	ID            int64   `json:"id"`
	AssetCategory string  `json:"assetCategory"`
	AssetName     string  `json:"assetName"`
	Specification string  `json:"specification"`
	Unit          string  `json:"unit"`
	BasePrice     float64 `json:"basePrice"`
	EffectiveDate *string `json:"effectiveDate"`
	ExpiryDate    *string `json:"expiryDate"`
	Remark        string  `json:"remark"`
}
