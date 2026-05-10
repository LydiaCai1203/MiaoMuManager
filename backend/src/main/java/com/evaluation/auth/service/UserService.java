package com.evaluation.auth.service;

import com.evaluation.auth.model.UserRequest;
import com.evaluation.auth.model.UserResponse;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final JdbcTemplate jdbcTemplate;

  public UserService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<UserResponse> list() {
    return jdbcTemplate.query(
        """
        SELECT id, username, real_name, phone, status
        FROM sys_user
        WHERE deleted = 0
        ORDER BY id DESC
        """,
        (rs, rowNum) -> new UserResponse(
            rs.getLong("id"),
            rs.getString("username"),
            rs.getString("real_name"),
            rs.getString("phone"),
            rs.getString("status")
        )
    );
  }

  @Transactional
  public UserResponse create(UserRequest request) {
    Long id = jdbcTemplate.queryForObject(
        """
        INSERT INTO sys_user (username, password_hash, real_name, phone, status)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
        """,
        Long.class,
        request.username(),
        "dev-password",
        request.realName(),
        request.phone(),
        request.status()
    );
    if (id == null) {
      throw new IllegalArgumentException("用户创建失败");
    }
    return getById(id);
  }

  @Transactional
  public UserResponse update(Long id, UserRequest request) {
    ensureExists(id);
    jdbcTemplate.update(
        """
        UPDATE sys_user
        SET username = ?, real_name = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        request.username(),
        request.realName(),
        request.phone(),
        request.status(),
        id
    );
    return getById(id);
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    jdbcTemplate.update("UPDATE sys_user SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private UserResponse getById(Long id) {
    List<UserResponse> results = jdbcTemplate.query(
        "SELECT id, username, real_name, phone, status FROM sys_user WHERE id = ? AND deleted = 0",
        (rs, rowNum) -> new UserResponse(
            rs.getLong("id"),
            rs.getString("username"),
            rs.getString("real_name"),
            rs.getString("phone"),
            rs.getString("status")
        ),
        id
    );
    if (results.isEmpty()) {
      throw new IllegalArgumentException("用户不存在: " + id);
    }
    return results.get(0);
  }

  private void ensureExists(Long id) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM sys_user WHERE id = ? AND deleted = 0",
        Integer.class,
        id
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("用户不存在: " + id);
    }
  }
}
