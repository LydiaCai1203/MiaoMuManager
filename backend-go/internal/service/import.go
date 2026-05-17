package service

import (
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/miaomumgr/backend-go/internal/model"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type ImportResult struct {
	TemplateType string `json:"templateType"`
	CreatedCount int    `json:"createdCount"`
	Message      string `json:"message"`
}

type ImportService struct {
	db *gorm.DB
}

func NewImportService(db *gorm.DB) *ImportService {
	return &ImportService{db: db}
}

var singleNumberPattern = regexp.MustCompile(`-?\d+(?:\.\d+)?`)

func (s *ImportService) ImportSeedling(projectID, partyID int64, filePath string) (*ImportResult, error) {
	if err := s.ensureProjectExists(projectID); err != nil {
		return nil, err
	}
	if err := s.ensurePartyExists(partyID); err != nil {
		return nil, err
	}

	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("无法打开 Excel 文件: %w", err)
	}
	defer f.Close()

	// Use second sheet if available
	sheets := f.GetSheetList()
	sheetName := sheets[0]
	if len(sheets) > 1 {
		sheetName = sheets[1]
	}

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("读取 Sheet 失败: %w", err)
	}

	type seedlingRow struct {
		lineNo       int
		seedlingName string
		spec         string
		unit         string
		quantity     float64
		unitPrice    float64
		amount       float64
		remark       string
	}

	var parsedRows []seedlingRow
	for _, row := range rows {
		name := cellValue(row, 1)
		if name == "" || name == "合计" || strings.Contains(name, "苗木名称") || name == "姓名" {
			continue
		}

		qtyText := cellValue(row, 4)
		priceText := cellValue(row, 5)
		amtText := cellValue(row, 6)

		if qtyText == "" && priceText == "" && amtText == "" {
			continue
		}

		qty := parseDecimal(qtyText)
		price := parseDecimal(priceText)
		amt := parseDecimal(amtText)
		if amtText == "" {
			amt = qty * price
		}

		unit := cellValue(row, 3)
		if unit == "" {
			unit = "株"
		}

		parsedRows = append(parsedRows, seedlingRow{
			lineNo:       len(parsedRows) + 1,
			seedlingName: name,
			spec:         cellValue(row, 2),
			unit:         unit,
			quantity:     qty,
			unitPrice:    price,
			amount:       amt,
			remark:       cellValue(row, 7),
		})
	}

	if len(parsedRows) == 0 {
		return nil, fmt.Errorf("苗木模板当前没有填写任何有效明细，请先在「苗木清查评估明细表」中补充苗木名称、数量和单价后再导入")
	}

	evaluationNo := buildNo("SEIMP")
	var totalAmount float64
	for _, r := range parsedRows {
		totalAmount += r.amount
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		evaluation := model.SeedlingEvaluation{
			ProjectID:     projectID,
			PartyID:       partyID,
			EvaluationNo:  evaluationNo,
			BenchmarkDate: todayPtr(),
			SurveyDate:    todayPtr(),
			TotalAmount:   totalAmount,
			Status:        "DRAFT",
			Remark:        "Excel 导入",
		}
		if err := tx.Create(&evaluation).Error; err != nil {
			return err
		}

		for _, r := range parsedRows {
			item := model.SeedlingEvaluationItem{
				EvaluationID:  evaluation.ID,
				LineNo:        r.lineNo,
				SeedlingName:  r.seedlingName,
				Specification: r.spec,
				Unit:          r.unit,
				Quantity:      r.quantity,
				UnitPrice:     r.unitPrice,
				Amount:        r.amount,
				Remark:        r.remark,
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

	return &ImportResult{
		TemplateType: "SEEDLING",
		CreatedCount: len(parsedRows),
		Message:      "苗木模板导入成功，生成评估单：" + evaluationNo,
	}, nil
}

func (s *ImportService) ImportAppendage(projectID, partyID int64, filePath string) (*ImportResult, error) {
	if err := s.ensureProjectExists(projectID); err != nil {
		return nil, err
	}
	if err := s.ensurePartyExists(partyID); err != nil {
		return nil, err
	}

	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("无法打开 Excel 文件: %w", err)
	}
	defer f.Close()

	sheets := f.GetSheetList()
	sheetName := sheets[0]
	if len(sheets) > 1 {
		sheetName = sheets[1]
	}

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("读取 Sheet 失败: %w", err)
	}

	type appendageRow struct {
		assetType            string
		assetCode            string
		lineNo               int
		itemName             string
		specification        string
		unit                 string
		quantity             float64
		replacementUnitPrice *float64
		replacementAmount    *float64
		noveltyRate          *float64
		evaluationUnitPrice  *float64
		evaluationAmount     float64
		remark               string
	}

	var parsedRows []appendageRow
	var currentType string

	for _, row := range rows {
		first := cellValue(row, 0)

		if strings.Contains(first, "构筑物补偿金额") {
			currentType = "STRUCTURE"
			continue
		}
		if strings.Contains(first, "设施设备及物品搬迁补偿金额") {
			currentType = "EQUIPMENT_MOVE"
			continue
		}
		if strings.Contains(first, "苗木移植补偿金额") {
			currentType = "SEEDLING_MOVE"
			continue
		}
		if currentType == "" || strings.Contains(first, "小计") || strings.Contains(first, "合计") {
			continue
		}

		lineNoText := cellValue(row, 2)
		if lineNoText == "" {
			lineNoText = cellValue(row, 1)
		}
		itemName := cellValue(row, 3)
		if itemName == "" {
			itemName = cellValue(row, 2)
		}
		if itemName == "" || itemName == "#REF!" {
			continue
		}

		qtyText := cellValue(row, 6)
		replPriceText := cellValue(row, 7)
		replAmtText := cellValue(row, 8)
		noveltyText := cellValue(row, 9)
		evalPriceText := cellValue(row, 10)
		evalAmtText := cellValue(row, 11)
		remark := cellValue(row, 12)

		qty := 1.0
		if qtyText != "" {
			qty = parseDecimal(qtyText)
		}

		evalPrice := 0.0
		if evalPriceText != "" {
			evalPrice = parseDecimal(evalPriceText)
		}

		evalAmt := qty * evalPrice
		if evalAmtText != "" {
			evalAmt = parseDecimal(evalAmtText)
		}

		if evalAmt <= 0 && evalPrice <= 0 {
			continue
		}

		r := appendageRow{
			assetType:        currentType,
			assetCode:        cellValue(row, 1),
			lineNo:           parseIntDefault(lineNoText, len(parsedRows)+1),
			itemName:         itemName,
			specification:    cellValue(row, 4),
			unit:             cellValue(row, 5),
			quantity:         qty,
			evaluationAmount: evalAmt,
			remark:           remark,
		}

		if replPriceText != "" {
			v := parseDecimal(replPriceText)
			r.replacementUnitPrice = &v
		}
		if replAmtText != "" {
			v := parseDecimal(replAmtText)
			r.replacementAmount = &v
		}
		if noveltyText != "" {
			v := parseDecimal(noveltyText)
			r.noveltyRate = &v
		}
		if evalPriceText != "" {
			r.evaluationUnitPrice = &evalPrice
		}

		parsedRows = append(parsedRows, r)
	}

	if len(parsedRows) == 0 {
		return nil, fmt.Errorf("附属物模板中没有可导入的有效明细")
	}

	// Calculate amounts by type
	var structureAmt, equipmentAmt, seedlingAmt float64
	for _, r := range parsedRows {
		switch r.assetType {
		case "STRUCTURE":
			structureAmt += r.evaluationAmount
		case "EQUIPMENT_MOVE":
			equipmentAmt += r.evaluationAmount
		case "SEEDLING_MOVE":
			seedlingAmt += r.evaluationAmount
		}
	}
	totalAmount := structureAmt + equipmentAmt + seedlingAmt
	evaluationNo := buildNo("APIMP")

	err = s.db.Transaction(func(tx *gorm.DB) error {
		evaluation := model.AppendageEvaluation{
			ProjectID:           projectID,
			PartyID:             partyID,
			EvaluationNo:        evaluationNo,
			BenchmarkDate:       todayPtr(),
			SurveyDate:          todayPtr(),
			StructureAmount:     structureAmt,
			EquipmentMoveAmount: equipmentAmt,
			SeedlingMoveAmount:  seedlingAmt,
			TotalAmount:         totalAmount,
			Status:              "DRAFT",
			Remark:              "Excel 导入",
		}
		if err := tx.Create(&evaluation).Error; err != nil {
			return err
		}

		for _, r := range parsedRows {
			item := model.AppendageEvaluationItem{
				EvaluationID:         evaluation.ID,
				AssetType:            r.assetType,
				AssetCode:            r.assetCode,
				LineNo:               r.lineNo,
				ItemName:             r.itemName,
				Specification:        r.specification,
				Unit:                 r.unit,
				Quantity:             r.quantity,
				ReplacementUnitPrice: r.replacementUnitPrice,
				ReplacementAmount:    r.replacementAmount,
				NoveltyRate:          r.noveltyRate,
				EvaluationUnitPrice:  r.evaluationUnitPrice,
				EvaluationAmount:     r.evaluationAmount,
				Remark:               r.remark,
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

	return &ImportResult{
		TemplateType: "APPENDAGE",
		CreatedCount: len(parsedRows),
		Message:      "附属物模板导入成功，生成评估单：" + evaluationNo,
	}, nil
}

func (s *ImportService) DownloadTemplate(templateName string) ([]byte, string, error) {
	// Look in /workspace first, then ./templates
	paths := []string{
		"/workspace/" + templateName,
		"./templates/" + templateName,
	}

	for _, path := range paths {
		data, err := os.ReadFile(path)
		if err == nil {
			encodedName := url.PathEscape(templateName)
			return data, encodedName, nil
		}
	}

	return nil, "", fmt.Errorf("模板文件不存在: %s", templateName)
}

func (s *ImportService) ensureProjectExists(projectID int64) error {
	var count int64
	s.db.Model(&model.EvaluationProject{}).Where("id = ? AND deleted = 0", projectID).Count(&count)
	if count == 0 {
		return fmt.Errorf("项目不存在: %d", projectID)
	}
	return nil
}

func (s *ImportService) ensurePartyExists(partyID int64) error {
	var count int64
	s.db.Model(&model.EvaluationParty{}).Where("id = ? AND deleted = 0", partyID).Count(&count)
	if count == 0 {
		return fmt.Errorf("被评估对象不存在: %d", partyID)
	}
	return nil
}

func buildNo(prefix string) string {
	return fmt.Sprintf("%s%d", prefix, time.Now().UnixNano()/1000)
}

func todayPtr() *string {
	t := time.Now().Format("2006-01-02")
	return &t
}

func cellValue(row []string, index int) string {
	if index >= len(row) {
		return ""
	}
	return strings.TrimSpace(row[index])
}

func parseDecimal(value string) float64 {
	raw := strings.ReplaceAll(strings.TrimSpace(value), ",", "")
	if raw == "" {
		return 0
	}

	matches := singleNumberPattern.FindAllString(raw, -1)
	if len(matches) == 0 || len(matches) > 1 {
		return 0
	}

	v, err := strconv.ParseFloat(matches[0], 64)
	if err != nil {
		return 0
	}
	return v
}

func parseIntDefault(value string, defaultVal int) int {
	if value == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return defaultVal
	}
	return v
}
