package com.evaluation.seedling.service;

import com.evaluation.seedling.model.SeedlingEvaluationItemRequest;
import com.evaluation.seedling.model.SeedlingEvaluationItemResponse;
import com.evaluation.seedling.model.SeedlingEvaluationRequest;
import com.evaluation.seedling.model.SeedlingEvaluationResponse;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SeedlingService {

  private final JdbcTemplate jdbcTemplate;

  public SeedlingService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<SeedlingEvaluationResponse> list() {
    String sql = """
        SELECT id, project_id, party_id, evaluation_no, benchmark_date, survey_date,
               total_amount, status, remark
        FROM seedling_evaluation
        WHERE deleted = 0
        ORDER BY id DESC
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> toResponse(
        rs.getLong("id"),
        rs.getLong("project_id"),
        rs.getLong("party_id"),
        rs.getString("evaluation_no"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        rs.getBigDecimal("total_amount"),
        rs.getString("status"),
        rs.getString("remark")
    ));
  }

  public SeedlingEvaluationResponse detail(Long id) {
    String sql = """
        SELECT id, project_id, party_id, evaluation_no, benchmark_date, survey_date,
               total_amount, status, remark
        FROM seedling_evaluation
        WHERE id = ? AND deleted = 0
        """;
    List<SeedlingEvaluationResponse> results = jdbcTemplate.query(sql, (rs, rowNum) -> toResponse(
        rs.getLong("id"),
        rs.getLong("project_id"),
        rs.getLong("party_id"),
        rs.getString("evaluation_no"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        rs.getBigDecimal("total_amount"),
        rs.getString("status"),
        rs.getString("remark")
    ), id);
    if (results.isEmpty()) {
      throw new IllegalArgumentException("苗木评估单不存在: " + id);
    }
    return results.get(0);
  }

  @Transactional
  public SeedlingEvaluationResponse create(SeedlingEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal totalAmount = request.items().stream()
        .map(SeedlingEvaluationItemRequest::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    String sql = """
        INSERT INTO seedling_evaluation (
          project_id, party_id, evaluation_no, benchmark_date, survey_date,
          total_amount, status, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """;
    Long key = jdbcTemplate.queryForObject(
        sql,
        Long.class,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        totalAmount,
        request.status(),
        request.remark()
    );
    if (key == null) {
      throw new IllegalArgumentException("苗木评估单创建失败");
    }

    Long evaluationId = key;
    saveItems(evaluationId, request.items());
    return detail(evaluationId);
  }

  @Transactional
  public SeedlingEvaluationResponse update(Long id, SeedlingEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());
    BigDecimal totalAmount = request.items().stream()
        .map(SeedlingEvaluationItemRequest::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    jdbcTemplate.update(
        """
        UPDATE seedling_evaluation
        SET project_id = ?, party_id = ?, evaluation_no = ?, benchmark_date = ?, survey_date = ?,
            total_amount = ?, status = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        totalAmount,
        request.status(),
        request.remark(),
        id
    );
    jdbcTemplate.update("UPDATE seedling_evaluation_item SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE evaluation_id = ?", id);
    saveItems(id, request.items());
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    jdbcTemplate.update("UPDATE seedling_evaluation_item SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE evaluation_id = ?", id);
    jdbcTemplate.update("UPDATE seedling_evaluation SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private void saveItems(Long evaluationId, List<SeedlingEvaluationItemRequest> items) {
    String sql = """
        INSERT INTO seedling_evaluation_item (
          evaluation_id, line_no, seedling_name, specification, unit,
          quantity, unit_price, amount, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
    for (SeedlingEvaluationItemRequest item : items) {
      jdbcTemplate.update(
          sql,
          evaluationId,
          item.lineNo(),
          item.seedlingName(),
          item.specification(),
          item.unit() == null || item.unit().isBlank() ? "株" : item.unit(),
          item.quantity(),
          item.unitPrice(),
          item.amount(),
          item.remark()
      );
    }
  }

  private List<SeedlingEvaluationItemResponse> listItems(Long evaluationId) {
    String sql = """
        SELECT id, evaluation_id, line_no, seedling_name, specification, unit,
               quantity, unit_price, amount, remark
        FROM seedling_evaluation_item
        WHERE evaluation_id = ? AND deleted = 0
        ORDER BY line_no
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new SeedlingEvaluationItemResponse(
        rs.getLong("id"),
        rs.getLong("evaluation_id"),
        rs.getInt("line_no"),
        rs.getString("seedling_name"),
        rs.getString("specification"),
        rs.getString("unit"),
        rs.getBigDecimal("quantity"),
        rs.getBigDecimal("unit_price"),
        rs.getBigDecimal("amount"),
        rs.getString("remark")
    ), evaluationId);
  }

  private SeedlingEvaluationResponse toResponse(
      Long id,
      Long projectId,
      Long partyId,
      String evaluationNo,
      String benchmarkDate,
      String surveyDate,
      BigDecimal totalAmount,
      String status,
      String remark
  ) {
    return new SeedlingEvaluationResponse(
        id,
        projectId,
        partyId,
        evaluationNo,
        benchmarkDate,
        surveyDate,
        totalAmount,
        status,
        remark,
        listItems(id)
    );
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
