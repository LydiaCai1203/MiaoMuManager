package com.evaluation.project.service;

import com.evaluation.project.model.PartyType;
import com.evaluation.project.model.ProjectPartyRequest;
import com.evaluation.project.model.ProjectPartyResponse;
import com.evaluation.project.model.ProjectRequest;
import com.evaluation.project.model.ProjectResponse;
import com.evaluation.project.model.ProjectStatus;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

  private final JdbcTemplate jdbcTemplate;

  public ProjectService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<ProjectResponse> listProjects() {
    String sql = """
        SELECT id, project_code, project_name, project_type, entrusting_party, region_name,
               benchmark_date, survey_date, status, remark
        FROM evaluation_project
        WHERE deleted = 0
        ORDER BY id
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> toProjectResponse(
        rs.getLong("id"),
        rs.getString("project_code"),
        rs.getString("project_name"),
        rs.getString("project_type"),
        rs.getString("entrusting_party"),
        rs.getString("region_name"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        ProjectStatus.valueOf(rs.getString("status")),
        rs.getString("remark"),
        true
    ));
  }

  public ProjectResponse getProject(Long id) {
    String sql = """
        SELECT id, project_code, project_name, project_type, entrusting_party, region_name,
               benchmark_date, survey_date, status, remark
        FROM evaluation_project
        WHERE id = ? AND deleted = 0
        """;
    List<ProjectResponse> results = jdbcTemplate.query(sql, (rs, rowNum) -> toProjectResponse(
        rs.getLong("id"),
        rs.getString("project_code"),
        rs.getString("project_name"),
        rs.getString("project_type"),
        rs.getString("entrusting_party"),
        rs.getString("region_name"),
        asString(rs.getDate("benchmark_date")),
        asString(rs.getDate("survey_date")),
        ProjectStatus.valueOf(rs.getString("status")),
        rs.getString("remark"),
        true
    ), id);
    if (results.isEmpty()) {
      throw new IllegalArgumentException("项目不存在: " + id);
    }
    return results.get(0);
  }

  @Transactional
  public ProjectResponse createProject(ProjectRequest request) {
    String sql = """
        INSERT INTO evaluation_project (
          project_code, project_name, project_type, entrusting_party, region_name,
          benchmark_date, survey_date, status, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """;
    Long key = jdbcTemplate.queryForObject(
        sql,
        Long.class,
        request.projectCode(),
        request.projectName(),
        request.projectType(),
        request.entrustingParty(),
        request.regionName(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        request.status().name(),
        request.remark()
    );
    if (key == null) {
      throw new IllegalArgumentException("项目创建失败");
    }
    return getProject(key);
  }

  @Transactional
  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    getProject(id);
    String sql = """
        UPDATE evaluation_project
        SET project_code = ?,
            project_name = ?,
            project_type = ?,
            entrusting_party = ?,
            region_name = ?,
            benchmark_date = ?,
            survey_date = ?,
            status = ?,
            remark = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """;
    jdbcTemplate.update(
        sql,
        request.projectCode(),
        request.projectName(),
        request.projectType(),
        request.entrustingParty(),
        request.regionName(),
        asDate(request.benchmarkDate()),
        asDate(request.surveyDate()),
        request.status().name(),
        request.remark(),
        id
    );
    return getProject(id);
  }

  @Transactional
  public void deleteProject(Long id) {
    ensureProjectExists(id);
    jdbcTemplate.update("UPDATE evaluation_party SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?", id);
    jdbcTemplate.update("UPDATE evaluation_project SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  public List<ProjectPartyResponse> listParties(Long projectId) {
    ensureProjectExists(projectId);
    String sql = """
        SELECT id, project_id, party_type, party_name, id_no, contact_phone,
               village_group, tenant_name, location_text, remark
        FROM evaluation_party
        WHERE project_id = ? AND deleted = 0
        ORDER BY id
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new ProjectPartyResponse(
        rs.getLong("id"),
        rs.getLong("project_id"),
        PartyType.valueOf(rs.getString("party_type")),
        rs.getString("party_name"),
        rs.getString("id_no"),
        rs.getString("contact_phone"),
        rs.getString("village_group"),
        rs.getString("tenant_name"),
        rs.getString("location_text"),
        rs.getString("remark")
    ), projectId);
  }

  @Transactional
  public ProjectPartyResponse createParty(Long projectId, ProjectPartyRequest request) {
    ensureProjectExists(projectId);
    String sql = """
        INSERT INTO evaluation_party (
          project_id, party_type, party_name, id_no, contact_phone,
          village_group, tenant_name, location_text, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """;
    Long key = jdbcTemplate.queryForObject(
        sql,
        Long.class,
        projectId,
        request.partyType().name(),
        request.partyName(),
        request.idNo(),
        request.contactPhone(),
        request.villageGroup(),
        request.tenantName(),
        request.locationText(),
        request.remark()
    );
    if (key == null) {
      throw new IllegalArgumentException("对象创建失败");
    }
    return listParties(projectId).stream()
        .filter(item -> item.id().equals(key))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("对象创建失败"));
  }

  @Transactional
  public ProjectPartyResponse updateParty(Long projectId, Long partyId, ProjectPartyRequest request) {
    ensurePartyExists(projectId, partyId);
    String sql = """
        UPDATE evaluation_party
        SET party_type = ?,
            party_name = ?,
            id_no = ?,
            contact_phone = ?,
            village_group = ?,
            tenant_name = ?,
            location_text = ?,
            remark = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND project_id = ? AND deleted = 0
        """;
    jdbcTemplate.update(
        sql,
        request.partyType().name(),
        request.partyName(),
        request.idNo(),
        request.contactPhone(),
        request.villageGroup(),
        request.tenantName(),
        request.locationText(),
        request.remark(),
        partyId,
        projectId
    );
    return listParties(projectId).stream()
        .filter(item -> item.id().equals(partyId))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("对象不存在: " + partyId));
  }

  @Transactional
  public void deleteParty(Long projectId, Long partyId) {
    ensurePartyExists(projectId, partyId);
    jdbcTemplate.update(
        "UPDATE evaluation_party SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?",
        partyId,
        projectId
    );
  }

  private ProjectResponse toProjectResponse(
      Long id,
      String projectCode,
      String projectName,
      String projectType,
      String entrustingParty,
      String regionName,
      String benchmarkDate,
      String surveyDate,
      ProjectStatus status,
      String remark,
      boolean includeParties
  ) {
    return new ProjectResponse(
        id,
        projectCode,
        projectName,
        projectType,
        entrustingParty,
        regionName,
        benchmarkDate,
        surveyDate,
        status,
        remark,
        includeParties ? listParties(id) : List.of()
    );
  }

  private void ensureProjectExists(Long id) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM evaluation_project WHERE id = ? AND deleted = 0",
        Integer.class,
        id
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("项目不存在: " + id);
    }
  }

  private void ensurePartyExists(Long projectId, Long partyId) {
    ensureProjectExists(projectId);
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM evaluation_party WHERE id = ? AND project_id = ? AND deleted = 0",
        Integer.class,
        partyId,
        projectId
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("对象不存在: " + partyId);
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
