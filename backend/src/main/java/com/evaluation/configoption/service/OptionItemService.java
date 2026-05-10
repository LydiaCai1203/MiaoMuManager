package com.evaluation.configoption.service;

import com.evaluation.configoption.model.OptionItemRequest;
import com.evaluation.configoption.model.OptionItemResponse;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OptionItemService {

  private final JdbcTemplate jdbcTemplate;

  public OptionItemService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<OptionItemResponse> listEnabledByGroup(String groupCode) {
    return jdbcTemplate.query(
        """
        SELECT id, group_code, option_value, option_label, sort_order, enabled, remark
        FROM option_item
        WHERE group_code = ? AND enabled = 1 AND deleted = 0
        ORDER BY sort_order, id
        """,
        (rs, rowNum) -> new OptionItemResponse(
            rs.getLong("id"),
            rs.getString("group_code"),
            rs.getString("option_value"),
            rs.getString("option_label"),
            rs.getInt("sort_order"),
            rs.getInt("enabled") == 1,
            rs.getString("remark")
        ),
        groupCode
    );
  }

  public List<OptionItemResponse> listAll(String groupCode) {
    if (groupCode == null || groupCode.isBlank()) {
      return jdbcTemplate.query(
          """
          SELECT id, group_code, option_value, option_label, sort_order, enabled, remark
          FROM option_item
          WHERE deleted = 0
          ORDER BY group_code, sort_order, id
          """,
          (rs, rowNum) -> mapRow(rs.getLong("id"), rs.getString("group_code"), rs.getString("option_value"), rs.getString("option_label"), rs.getInt("sort_order"), rs.getInt("enabled") == 1, rs.getString("remark"))
      );
    }
    return jdbcTemplate.query(
        """
        SELECT id, group_code, option_value, option_label, sort_order, enabled, remark
        FROM option_item
        WHERE group_code = ? AND deleted = 0
        ORDER BY sort_order, id
        """,
        (rs, rowNum) -> mapRow(rs.getLong("id"), rs.getString("group_code"), rs.getString("option_value"), rs.getString("option_label"), rs.getInt("sort_order"), rs.getInt("enabled") == 1, rs.getString("remark")),
        groupCode
    );
  }

  @Transactional
  public OptionItemResponse create(OptionItemRequest request) {
    Long id = jdbcTemplate.queryForObject(
        """
        INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
        """,
        Long.class,
        normalize(request.groupCode()),
        request.optionValue(),
        request.optionLabel(),
        request.sortOrder(),
        request.enabled() ? 1 : 0,
        request.remark()
    );
    if (id == null) {
      throw new IllegalArgumentException("配置项创建失败");
    }
    return getById(id);
  }

  @Transactional
  public OptionItemResponse update(Long id, OptionItemRequest request) {
    ensureExists(id);
    jdbcTemplate.update(
        """
        UPDATE option_item
        SET group_code = ?,
            option_value = ?,
            option_label = ?,
            sort_order = ?,
            enabled = ?,
            remark = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        normalize(request.groupCode()),
        request.optionValue(),
        request.optionLabel(),
        request.sortOrder(),
        request.enabled() ? 1 : 0,
        request.remark(),
        id
    );
    return getById(id);
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    jdbcTemplate.update("UPDATE option_item SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private OptionItemResponse getById(Long id) {
    List<OptionItemResponse> results = jdbcTemplate.query(
        """
        SELECT id, group_code, option_value, option_label, sort_order, enabled, remark
        FROM option_item
        WHERE id = ? AND deleted = 0
        """,
        (rs, rowNum) -> mapRow(rs.getLong("id"), rs.getString("group_code"), rs.getString("option_value"), rs.getString("option_label"), rs.getInt("sort_order"), rs.getInt("enabled") == 1, rs.getString("remark")),
        id
    );
    if (results.isEmpty()) {
      throw new IllegalArgumentException("配置项不存在: " + id);
    }
    return results.get(0);
  }

  private void ensureExists(Long id) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM option_item WHERE id = ? AND deleted = 0",
        Integer.class,
        id
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("配置项不存在: " + id);
    }
  }

  private String normalize(String value) {
    return value == null ? null : value.trim().toUpperCase();
  }

  private OptionItemResponse mapRow(Long id, String groupCode, String optionValue, String optionLabel, Integer sortOrder, Boolean enabled, String remark) {
    return new OptionItemResponse(id, groupCode, optionValue, optionLabel, sortOrder, enabled, remark);
  }
}
