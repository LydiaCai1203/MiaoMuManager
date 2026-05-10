package com.evaluation.house.service;

import com.evaluation.house.model.HouseEvaluationRequest;
import com.evaluation.house.model.HouseEvaluationResponse;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HouseService {

  private final JdbcTemplate jdbcTemplate;

  public HouseService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<HouseEvaluationResponse> list() {
    return jdbcTemplate.query(
        """
        SELECT id, project_id, party_id, evaluation_no, location_text, usage_type,
               building_area, unit_price, region_factor, floor_factor, orientation_factor,
               decoration_factor, total_amount, benchmark_date, survey_date, status, remark
        FROM house_evaluation
        WHERE deleted = 0
        ORDER BY id DESC
        """,
        (rs, rowNum) -> new HouseEvaluationResponse(
            rs.getLong("id"),
            rs.getLong("project_id"),
            rs.getLong("party_id"),
            rs.getString("evaluation_no"),
            rs.getString("location_text"),
            rs.getString("usage_type"),
            rs.getBigDecimal("building_area"),
            rs.getBigDecimal("unit_price"),
            rs.getBigDecimal("region_factor"),
            rs.getBigDecimal("floor_factor"),
            rs.getBigDecimal("orientation_factor"),
            rs.getBigDecimal("decoration_factor"),
            rs.getBigDecimal("total_amount"),
            asString(rs.getDate("benchmark_date")),
            asString(rs.getDate("survey_date")),
            rs.getString("status"),
            rs.getString("remark")
        )
    );
  }

  public HouseEvaluationResponse detail(Long id) {
    List<HouseEvaluationResponse> results = jdbcTemplate.query(
        """
        SELECT id, project_id, party_id, evaluation_no, location_text, usage_type,
               building_area, unit_price, region_factor, floor_factor, orientation_factor,
               decoration_factor, total_amount, benchmark_date, survey_date, status, remark
        FROM house_evaluation
        WHERE id = ? AND deleted = 0
        """,
        (rs, rowNum) -> new HouseEvaluationResponse(
            rs.getLong("id"),
            rs.getLong("project_id"),
            rs.getLong("party_id"),
            rs.getString("evaluation_no"),
            rs.getString("location_text"),
            rs.getString("usage_type"),
            rs.getBigDecimal("building_area"),
            rs.getBigDecimal("unit_price"),
            rs.getBigDecimal("region_factor"),
            rs.getBigDecimal("floor_factor"),
            rs.getBigDecimal("orientation_factor"),
            rs.getBigDecimal("decoration_factor"),
            rs.getBigDecimal("total_amount"),
            asString(rs.getDate("benchmark_date")),
            asString(rs.getDate("survey_date")),
            rs.getString("status"),
            rs.getString("remark")
        ),
        id
    );
    if (results.isEmpty()) {
      throw new IllegalArgumentException("房屋评估单不存在: " + id);
    }
    return results.get(0);
  }

  @Transactional
  public HouseEvaluationResponse create(HouseEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());
    BigDecimal totalAmount = calculateTotal(request);
    Long id = jdbcTemplate.queryForObject(
        """
        INSERT INTO house_evaluation (
          project_id, party_id, evaluation_no, location_text, usage_type, building_area,
          unit_price, region_factor, floor_factor, orientation_factor, decoration_factor,
          total_amount, benchmark_date, survey_date, status, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """,
        Long.class,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        request.locationText(),
        request.usageType(),
        request.buildingArea(),
        request.unitPrice(),
        request.regionFactor(),
        request.floorFactor(),
        request.orientationFactor(),
        request.decorationFactor(),
        totalAmount,
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        request.status(),
        request.remark()
    );
    if (id == null) {
      throw new IllegalArgumentException("房屋评估单创建失败");
    }
    return detail(id);
  }

  @Transactional
  public HouseEvaluationResponse update(Long id, HouseEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());
    BigDecimal totalAmount = calculateTotal(request);
    jdbcTemplate.update(
        """
        UPDATE house_evaluation
        SET project_id = ?, party_id = ?, evaluation_no = ?, location_text = ?, usage_type = ?,
            building_area = ?, unit_price = ?, region_factor = ?, floor_factor = ?,
            orientation_factor = ?, decoration_factor = ?, total_amount = ?, benchmark_date = ?,
            survey_date = ?, status = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        request.projectId(),
        request.partyId(),
        request.evaluationNo(),
        request.locationText(),
        request.usageType(),
        request.buildingArea(),
        request.unitPrice(),
        request.regionFactor(),
        request.floorFactor(),
        request.orientationFactor(),
        request.decorationFactor(),
        totalAmount,
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        request.status(),
        request.remark(),
        id
    );
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    jdbcTemplate.update("UPDATE house_evaluation SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private BigDecimal calculateTotal(HouseEvaluationRequest request) {
    return request.buildingArea()
        .multiply(request.unitPrice())
        .multiply(request.regionFactor())
        .multiply(request.floorFactor())
        .multiply(request.orientationFactor())
        .multiply(request.decorationFactor());
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
