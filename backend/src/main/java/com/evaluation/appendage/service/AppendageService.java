package com.evaluation.appendage.service;

import com.evaluation.appendage.model.AppendageEvaluationItemRequest;
import com.evaluation.appendage.model.AppendageEvaluationItemResponse;
import com.evaluation.appendage.model.AppendageEvaluationRequest;
import com.evaluation.appendage.model.AppendageEvaluationResponse;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppendageService {

  private static final String STRUCTURE = "STRUCTURE";
  private static final String EQUIPMENT_MOVE = "EQUIPMENT_MOVE";
  private static final String SEEDLING_MOVE = "SEEDLING_MOVE";

  private final JdbcTemplate jdbcTemplate;

  public AppendageService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<AppendageEvaluationResponse> list() {
    String sql = """
        SELECT id, project_id, party_id, evaluation_no, tenant_name, location_text,
               benchmark_date, survey_date, structure_amount, equipment_move_amount,
               seedling_move_amount, total_amount, status, remark
        FROM appendage_evaluation
        WHERE deleted = 0
        ORDER BY id DESC
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> toResponse(
        rs.getLong("id"),
        rs.getLong("project_id"),
        rs.getLong("party_id"),
        rs.getString("evaluation_no"),
        rs.getString("tenant_name"),
        rs.getString("location_text"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        rs.getBigDecimal("structure_amount"),
        rs.getBigDecimal("equipment_move_amount"),
        rs.getBigDecimal("seedling_move_amount"),
        rs.getBigDecimal("total_amount"),
        rs.getString("status"),
        rs.getString("remark")
    ));
  }

  @Transactional
  public AppendageEvaluationResponse create(AppendageEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal structureAmount = sumByType(request.items(), STRUCTURE);
    BigDecimal equipmentMoveAmount = sumByType(request.items(), EQUIPMENT_MOVE);
    BigDecimal seedlingMoveAmount = sumByType(request.items(), SEEDLING_MOVE);
    BigDecimal totalAmount = structureAmount.add(equipmentMoveAmount).add(seedlingMoveAmount);

    String sql = """
        INSERT INTO appendage_evaluation (
          project_id, party_id, evaluation_no, tenant_name, location_text,
          benchmark_date, survey_date, structure_amount, equipment_move_amount,
          seedling_move_amount, total_amount, status, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """;
    Long evaluationId = jdbcTemplate.queryForObject(
        sql,
        Long.class,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        request.tenantName(),
        request.locationText(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        structureAmount,
        equipmentMoveAmount,
        seedlingMoveAmount,
        totalAmount,
        request.status(),
        request.remark()
    );
    if (evaluationId == null) {
      throw new IllegalArgumentException("附属物评估单创建失败");
    }

    saveItems(evaluationId, request.items());
    return detail(evaluationId);
  }

  @Transactional
  public AppendageEvaluationResponse update(Long id, AppendageEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal structureAmount = sumByType(request.items(), STRUCTURE);
    BigDecimal equipmentMoveAmount = sumByType(request.items(), EQUIPMENT_MOVE);
    BigDecimal seedlingMoveAmount = sumByType(request.items(), SEEDLING_MOVE);
    BigDecimal totalAmount = structureAmount.add(equipmentMoveAmount).add(seedlingMoveAmount);

    jdbcTemplate.update(
        """
        UPDATE appendage_evaluation
        SET project_id = ?, party_id = ?, evaluation_no = ?, tenant_name = ?, location_text = ?,
            benchmark_date = ?, survey_date = ?, structure_amount = ?, equipment_move_amount = ?,
            seedling_move_amount = ?, total_amount = ?, status = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        request.tenantName(),
        request.locationText(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        structureAmount,
        equipmentMoveAmount,
        seedlingMoveAmount,
        totalAmount,
        request.status(),
        request.remark(),
        id
    );
    jdbcTemplate.update("UPDATE appendage_evaluation_item SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE evaluation_id = ?", id);
    saveItems(id, request.items());
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    jdbcTemplate.update("UPDATE appendage_evaluation_item SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE evaluation_id = ?", id);
    jdbcTemplate.update("UPDATE appendage_evaluation SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  public AppendageEvaluationResponse detail(Long id) {
    String sql = """
        SELECT id, project_id, party_id, evaluation_no, tenant_name, location_text,
               benchmark_date, survey_date, structure_amount, equipment_move_amount,
               seedling_move_amount, total_amount, status, remark
        FROM appendage_evaluation
        WHERE id = ? AND deleted = 0
        """;
    List<AppendageEvaluationResponse> results = jdbcTemplate.query(sql, (rs, rowNum) -> toResponse(
        rs.getLong("id"),
        rs.getLong("project_id"),
        rs.getLong("party_id"),
        rs.getString("evaluation_no"),
        rs.getString("tenant_name"),
        rs.getString("location_text"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        rs.getBigDecimal("structure_amount"),
        rs.getBigDecimal("equipment_move_amount"),
        rs.getBigDecimal("seedling_move_amount"),
        rs.getBigDecimal("total_amount"),
        rs.getString("status"),
        rs.getString("remark")
    ), id);
    if (results.isEmpty()) {
      throw new IllegalArgumentException("附属物评估单不存在: " + id);
    }
    return results.get(0);
  }

  private void saveItems(Long evaluationId, List<AppendageEvaluationItemRequest> items) {
    String sql = """
        INSERT INTO appendage_evaluation_item (
          evaluation_id, asset_type, asset_code, line_no, item_name, specification,
          unit, quantity, replacement_unit_price, replacement_amount, novelty_rate,
          evaluation_unit_price, evaluation_amount, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
    for (AppendageEvaluationItemRequest item : items) {
      jdbcTemplate.update(
          sql,
          evaluationId,
          item.assetType(),
          item.assetCode(),
          item.lineNo(),
          item.itemName(),
          item.specification(),
          item.unit(),
          item.quantity(),
          item.replacementUnitPrice(),
          item.replacementAmount(),
          item.noveltyRate(),
          item.evaluationUnitPrice(),
          item.evaluationAmount(),
          item.remark()
      );
    }
  }

  private List<AppendageEvaluationItemResponse> listItems(Long evaluationId) {
    String sql = """
        SELECT id, evaluation_id, asset_type, asset_code, line_no, item_name, specification,
               unit, quantity, replacement_unit_price, replacement_amount, novelty_rate,
               evaluation_unit_price, evaluation_amount, remark
        FROM appendage_evaluation_item
        WHERE evaluation_id = ? AND deleted = 0
        ORDER BY asset_type, line_no
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new AppendageEvaluationItemResponse(
        rs.getLong("id"),
        rs.getLong("evaluation_id"),
        rs.getString("asset_type"),
        rs.getString("asset_code"),
        rs.getInt("line_no"),
        rs.getString("item_name"),
        rs.getString("specification"),
        rs.getString("unit"),
        rs.getBigDecimal("quantity"),
        rs.getBigDecimal("replacement_unit_price"),
        rs.getBigDecimal("replacement_amount"),
        rs.getBigDecimal("novelty_rate"),
        rs.getBigDecimal("evaluation_unit_price"),
        rs.getBigDecimal("evaluation_amount"),
        rs.getString("remark")
    ), evaluationId);
  }

  private AppendageEvaluationResponse toResponse(
      Long id,
      Long projectId,
      Long partyId,
      String evaluationNo,
      String tenantName,
      String locationText,
      String benchmarkDate,
      String surveyDate,
      BigDecimal structureAmount,
      BigDecimal equipmentMoveAmount,
      BigDecimal seedlingMoveAmount,
      BigDecimal totalAmount,
      String status,
      String remark
  ) {
    return new AppendageEvaluationResponse(
        id,
        projectId,
        partyId,
        evaluationNo,
        tenantName,
        locationText,
        benchmarkDate,
        surveyDate,
        structureAmount,
        equipmentMoveAmount,
        seedlingMoveAmount,
        totalAmount,
        status,
        remark,
        listItems(id)
    );
  }

  private BigDecimal sumByType(List<AppendageEvaluationItemRequest> items, String assetType) {
    return items.stream()
        .filter(item -> assetType.equals(item.assetType()))
        .map(AppendageEvaluationItemRequest::evaluationAmount)
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

  private Date asDate(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return Date.valueOf(LocalDate.parse(value));
  }

  private String asString(Date value) {
    return value == null ? null : value.toLocalDate().toString();
  }
}
