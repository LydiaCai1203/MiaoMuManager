package com.evaluation.importtask.service;

import com.evaluation.appendage.entity.AppendageEvaluationEntity;
import com.evaluation.appendage.entity.AppendageEvaluationItemEntity;
import com.evaluation.appendage.mapper.AppendageEvaluationItemMapper;
import com.evaluation.appendage.mapper.AppendageEvaluationMapper;
import com.evaluation.importtask.model.ImportResult;
import com.evaluation.project.mapper.EvaluationPartyMapper;
import com.evaluation.project.mapper.EvaluationProjectMapper;
import com.evaluation.seedling.entity.SeedlingEvaluationEntity;
import com.evaluation.seedling.entity.SeedlingEvaluationItemEntity;
import com.evaluation.seedling.mapper.SeedlingEvaluationItemMapper;
import com.evaluation.seedling.mapper.SeedlingEvaluationMapper;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImportService {

  private static final Pattern SINGLE_NUMBER_PATTERN = Pattern.compile("-?\\d+(?:\\.\\d+)?");

  private final SeedlingEvaluationMapper seedlingMapper;
  private final SeedlingEvaluationItemMapper seedlingItemMapper;
  private final AppendageEvaluationMapper appendageMapper;
  private final AppendageEvaluationItemMapper appendageItemMapper;
  private final EvaluationProjectMapper projectMapper;
  private final EvaluationPartyMapper partyMapper;
  private final DataFormatter formatter = new DataFormatter();

  public ImportService(SeedlingEvaluationMapper seedlingMapper,
                       SeedlingEvaluationItemMapper seedlingItemMapper,
                       AppendageEvaluationMapper appendageMapper,
                       AppendageEvaluationItemMapper appendageItemMapper,
                       EvaluationProjectMapper projectMapper,
                       EvaluationPartyMapper partyMapper) {
    this.seedlingMapper = seedlingMapper;
    this.seedlingItemMapper = seedlingItemMapper;
    this.appendageMapper = appendageMapper;
    this.appendageItemMapper = appendageItemMapper;
    this.projectMapper = projectMapper;
    this.partyMapper = partyMapper;
  }

  @Transactional
  public ImportResult importSeedling(Long projectId, Long partyId, MultipartFile file) throws IOException {
    ensureProjectExists(projectId);
    ensurePartyExists(projectId, partyId);

    try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
      Sheet sheet = workbook.getSheetAt(workbook.getNumberOfSheets() > 1 ? 1 : 0);
      List<SeedlingRow> rows = parseSeedlingRows(sheet);
      if (rows.isEmpty()) {
        throw new IllegalArgumentException("苗木模板当前没有填写任何有效明细，请先在"苗木清查评估明细表"中补充苗木名称、数量和单价后再导入");
      }

      String evaluationNo = buildNo("SEIMP");
      BigDecimal totalAmount = rows.stream().map(SeedlingRow::amount).reduce(BigDecimal.ZERO, BigDecimal::add);

      SeedlingEvaluationEntity evaluation = new SeedlingEvaluationEntity();
      evaluation.setProjectId(projectId);
      evaluation.setPartyId(partyId);
      evaluation.setEvaluationNo(evaluationNo);
      evaluation.setBenchmarkDate(LocalDate.now());
      evaluation.setSurveyDate(LocalDate.now());
      evaluation.setTotalAmount(totalAmount);
      evaluation.setStatus("DRAFT");
      evaluation.setRemark("Excel 导入");
      seedlingMapper.insert(evaluation);

      for (SeedlingRow row : rows) {
        SeedlingEvaluationItemEntity item = new SeedlingEvaluationItemEntity();
        item.setEvaluationId(evaluation.getId());
        item.setLineNo(row.lineNo());
        item.setSeedlingName(row.seedlingName());
        item.setSpecification(row.specification());
        item.setUnit(row.unit());
        item.setQuantity(row.quantity());
        item.setUnitPrice(row.unitPrice());
        item.setAmount(row.amount());
        item.setRemark(row.remark());
        seedlingItemMapper.insert(item);
      }

      return new ImportResult("SEEDLING", rows.size(), "苗木模板导入成功，生成评估单：" + evaluationNo);
    }
  }

  @Transactional
  public ImportResult importAppendage(Long projectId, Long partyId, MultipartFile file) throws IOException {
    ensureProjectExists(projectId);
    ensurePartyExists(projectId, partyId);

    try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
      Sheet sheet = workbook.getSheetAt(workbook.getNumberOfSheets() > 1 ? 1 : 0);
      List<AppendageRow> rows = parseAppendageRows(sheet);
      if (rows.isEmpty()) {
        throw new IllegalArgumentException("附属物模板中没有可导入的有效明细");
      }

      BigDecimal structureAmount = sumByType(rows, "STRUCTURE");
      BigDecimal equipmentAmount = sumByType(rows, "EQUIPMENT_MOVE");
      BigDecimal seedlingAmount = sumByType(rows, "SEEDLING_MOVE");
      BigDecimal totalAmount = structureAmount.add(equipmentAmount).add(seedlingAmount);
      String evaluationNo = buildNo("APIMP");

      AppendageEvaluationEntity evaluation = new AppendageEvaluationEntity();
      evaluation.setProjectId(projectId);
      evaluation.setPartyId(partyId);
      evaluation.setEvaluationNo(evaluationNo);
      evaluation.setBenchmarkDate(LocalDate.now());
      evaluation.setSurveyDate(LocalDate.now());
      evaluation.setStructureAmount(structureAmount);
      evaluation.setEquipmentMoveAmount(equipmentAmount);
      evaluation.setSeedlingMoveAmount(seedlingAmount);
      evaluation.setTotalAmount(totalAmount);
      evaluation.setStatus("DRAFT");
      evaluation.setRemark("Excel 导入");
      appendageMapper.insert(evaluation);

      for (AppendageRow row : rows) {
        AppendageEvaluationItemEntity item = new AppendageEvaluationItemEntity();
        item.setEvaluationId(evaluation.getId());
        item.setAssetType(row.assetType());
        item.setAssetCode(row.assetCode());
        item.setLineNo(row.lineNo());
        item.setItemName(row.itemName());
        item.setSpecification(row.specification());
        item.setUnit(row.unit());
        item.setQuantity(row.quantity());
        item.setReplacementUnitPrice(row.replacementUnitPrice());
        item.setReplacementAmount(row.replacementAmount());
        item.setNoveltyRate(row.noveltyRate());
        item.setEvaluationUnitPrice(row.evaluationUnitPrice());
        item.setEvaluationAmount(row.evaluationAmount());
        item.setRemark(row.remark());
        appendageItemMapper.insert(item);
      }

      return new ImportResult("APPENDAGE", rows.size(), "附属物模板导入成功，生成评估单：" + evaluationNo);
    }
  }

  private List<SeedlingRow> parseSeedlingRows(Sheet sheet) {
    List<SeedlingRow> rows = new ArrayList<>();
    for (int i = 0; i <= sheet.getLastRowNum(); i++) {
      Row row = sheet.getRow(i);
      if (row == null) {
        continue;
      }
      String name = cell(row, 1);
      if (name == null || name.isBlank() || "合计".equals(name) || name.contains("苗木名称") || "姓名".equals(name)) {
        continue;
      }
      String quantityText = cell(row, 4);
      String unitPriceText = cell(row, 5);
      String amountText = cell(row, 6);
      if (quantityText.isBlank() && unitPriceText.isBlank() && amountText.isBlank()) {
        continue;
      }
      BigDecimal quantity = decimal(quantityText);
      BigDecimal unitPrice = decimal(unitPriceText);
      BigDecimal amount = amountText.isBlank() ? quantity.multiply(unitPrice) : decimal(amountText);
      rows.add(new SeedlingRow(
          rows.size() + 1,
          name,
          cell(row, 2),
          blankToDefault(cell(row, 3), "株"),
          quantity,
          unitPrice,
          amount,
          cell(row, 7)
      ));
    }
    return rows;
  }

  private List<AppendageRow> parseAppendageRows(Sheet sheet) {
    List<AppendageRow> rows = new ArrayList<>();
    String currentType = null;
    for (int i = 0; i <= sheet.getLastRowNum(); i++) {
      Row row = sheet.getRow(i);
      if (row == null) {
        continue;
      }
      String first = cell(row, 0);
      if (first.contains("构筑物补偿金额")) {
        currentType = "STRUCTURE";
        continue;
      }
      if (first.contains("设施设备及物品搬迁补偿金额")) {
        currentType = "EQUIPMENT_MOVE";
        continue;
      }
      if (first.contains("苗木移植补偿金额")) {
        currentType = "SEEDLING_MOVE";
        continue;
      }
      if (currentType == null || first.contains("小计") || first.contains("合计")) {
        continue;
      }

      String lineNoText = cell(row, 2).isBlank() ? cell(row, 1) : cell(row, 2);
      String itemName = cell(row, 3).isBlank() ? cell(row, 2) : cell(row, 3);
      if (itemName == null || itemName.isBlank() || "#REF!".equals(itemName)) {
        continue;
      }

      String specification = cell(row, 4);
      String unit = cell(row, 5);
      String quantityText = cell(row, 6);
      String replacementUnitPriceText = cell(row, 7);
      String replacementAmountText = cell(row, 8);
      String noveltyRateText = cell(row, 9);
      String evaluationUnitPriceText = cell(row, 10);
      String evaluationAmountText = cell(row, 11);
      String remark = cell(row, 12);

      BigDecimal quantity = quantityText.isBlank() ? BigDecimal.ONE : decimal(quantityText);
      BigDecimal evaluationUnitPrice = evaluationUnitPriceText.isBlank() ? BigDecimal.ZERO : decimal(evaluationUnitPriceText);
      BigDecimal evaluationAmount = evaluationAmountText.isBlank() ? quantity.multiply(evaluationUnitPrice) : decimal(evaluationAmountText);
      if (evaluationAmount.compareTo(BigDecimal.ZERO) <= 0 && evaluationUnitPrice.compareTo(BigDecimal.ZERO) <= 0) {
        continue;
      }

      rows.add(new AppendageRow(
          currentType,
          cell(row, 1),
          parseInt(lineNoText, rows.size() + 1),
          itemName,
          specification,
          unit,
          quantity,
          replacementUnitPriceText.isBlank() ? null : decimal(replacementUnitPriceText),
          replacementAmountText.isBlank() ? null : decimal(replacementAmountText),
          noveltyRateText.isBlank() ? null : decimal(noveltyRateText),
          evaluationUnitPriceText.isBlank() ? null : evaluationUnitPrice,
          evaluationAmount,
          remark
      ));
    }
    return rows;
  }

  private String buildNo(String prefix) {
    return prefix + System.currentTimeMillis();
  }

  private String cell(Row row, int index) {
    Cell cell = row.getCell(index);
    return cell == null ? "" : formatter.formatCellValue(cell).trim();
  }

  private String blankToDefault(String value, String defaultValue) {
    return value == null || value.isBlank() ? defaultValue : value;
  }

  private BigDecimal decimal(String value) {
    String raw = value == null ? "" : value.replace(",", "").trim();
    if (raw.isBlank()) {
      return BigDecimal.ZERO;
    }

    Matcher matcher = SINGLE_NUMBER_PATTERN.matcher(raw);
    List<String> numbers = new ArrayList<>();
    while (matcher.find()) {
      numbers.add(matcher.group());
    }

    if (numbers.isEmpty()) {
      return BigDecimal.ZERO;
    }
    if (numbers.size() > 1) {
      return BigDecimal.ZERO;
    }
    return new BigDecimal(numbers.get(0));
  }

  private int parseInt(String value, int defaultValue) {
    if (value == null || value.isBlank()) {
      return defaultValue;
    }
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException ex) {
      return defaultValue;
    }
  }

  private BigDecimal sumByType(List<AppendageRow> rows, String assetType) {
    return rows.stream()
        .filter(row -> assetType.equals(row.assetType()))
        .map(AppendageRow::evaluationAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private void ensureProjectExists(Long projectId) {
    if (projectMapper.selectById(projectId) == null) {
      throw new IllegalArgumentException("项目不存在: " + projectId);
    }
  }

  private void ensurePartyExists(Long projectId, Long partyId) {
    if (partyMapper.selectById(partyId) == null) {
      throw new IllegalArgumentException("被评估对象不存在: " + partyId);
    }
  }

  private record SeedlingRow(
      int lineNo,
      String seedlingName,
      String specification,
      String unit,
      BigDecimal quantity,
      BigDecimal unitPrice,
      BigDecimal amount,
      String remark
  ) {
  }

  private record AppendageRow(
      String assetType,
      String assetCode,
      int lineNo,
      String itemName,
      String specification,
      String unit,
      BigDecimal quantity,
      BigDecimal replacementUnitPrice,
      BigDecimal replacementAmount,
      BigDecimal noveltyRate,
      BigDecimal evaluationUnitPrice,
      BigDecimal evaluationAmount,
      String remark
  ) {
  }
}
