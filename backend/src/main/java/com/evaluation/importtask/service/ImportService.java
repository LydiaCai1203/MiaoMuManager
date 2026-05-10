package com.evaluation.importtask.service;

import com.evaluation.importtask.model.ImportResult;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Date;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImportService {

  private static final Pattern SINGLE_NUMBER_PATTERN = Pattern.compile("-?\\d+(?:\\.\\d+)?");

  private final JdbcTemplate jdbcTemplate;
  private final DataFormatter formatter = new DataFormatter();

  public ImportService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Transactional
  public ImportResult importSeedling(Long projectId, Long partyId, MultipartFile file) throws IOException {
    ensureProjectExists(projectId);
    ensurePartyExists(projectId, partyId);

    try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
      Sheet sheet = workbook.getSheetAt(workbook.getNumberOfSheets() > 1 ? 1 : 0);
      List<SeedlingRow> rows = parseSeedlingRows(sheet);
      if (rows.isEmpty()) {
        throw new IllegalArgumentException("苗木模板当前没有填写任何有效明细，请先在“苗木清查评估明细表”中补充苗木名称、数量和单价后再导入");
      }

      String evaluationNo = buildNo("SEIMP");
      BigDecimal totalAmount = rows.stream().map(SeedlingRow::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
      Long evaluationId = jdbcTemplate.queryForObject(
          """
          INSERT INTO seedling_evaluation (
            project_id, party_id, evaluation_no, benchmark_date, survey_date,
            total_amount, status, remark
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id
          """,
          Long.class,
          projectId,
          partyId,
          evaluationNo,
          Date.valueOf(LocalDate.now()),
          Date.valueOf(LocalDate.now()),
          totalAmount,
          "DRAFT",
          "Excel 导入"
      );
      if (evaluationId == null) {
        throw new IllegalArgumentException("苗木导入失败");
      }

      for (SeedlingRow row : rows) {
        jdbcTemplate.update(
            """
            INSERT INTO seedling_evaluation_item (
              evaluation_id, line_no, seedling_name, specification, unit,
              quantity, unit_price, amount, remark
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            evaluationId,
            row.lineNo(),
            row.seedlingName(),
            row.specification(),
            row.unit(),
            row.quantity(),
            row.unitPrice(),
            row.amount(),
            row.remark()
        );
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

      Long evaluationId = jdbcTemplate.queryForObject(
          """
          INSERT INTO appendage_evaluation (
            project_id, party_id, evaluation_no, tenant_name, location_text,
            benchmark_date, survey_date, structure_amount, equipment_move_amount,
            seedling_move_amount, total_amount, status, remark
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id
          """,
          Long.class,
          projectId,
          partyId,
          evaluationNo,
          null,
          null,
          Date.valueOf(LocalDate.now()),
          Date.valueOf(LocalDate.now()),
          structureAmount,
          equipmentAmount,
          seedlingAmount,
          totalAmount,
          "DRAFT",
          "Excel 导入"
      );
      if (evaluationId == null) {
        throw new IllegalArgumentException("附属物导入失败");
      }

      for (AppendageRow row : rows) {
        jdbcTemplate.update(
            """
            INSERT INTO appendage_evaluation_item (
              evaluation_id, asset_type, asset_code, line_no, item_name, specification,
              unit, quantity, replacement_unit_price, replacement_amount, novelty_rate,
              evaluation_unit_price, evaluation_amount, remark
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            evaluationId,
            row.assetType(),
            row.assetCode(),
            row.lineNo(),
            row.itemName(),
            row.specification(),
            row.unit(),
            row.quantity(),
            row.replacementUnitPrice(),
            row.replacementAmount(),
            row.noveltyRate(),
            row.evaluationUnitPrice(),
            row.evaluationAmount(),
            row.remark()
        );
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
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM evaluation_project WHERE id = ? AND deleted = 0",
        Integer.class,
        projectId
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("项目不存在: " + projectId);
    }
  }

  private void ensurePartyExists(Long projectId, Long partyId) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM evaluation_party WHERE id = ? AND project_id = ? AND deleted = 0",
        Integer.class,
        partyId,
        projectId
    );
    if (count == null || count == 0) {
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
