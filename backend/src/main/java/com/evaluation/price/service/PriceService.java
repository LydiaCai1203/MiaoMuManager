package com.evaluation.price.service;

import com.evaluation.price.model.PriceRequest;
import com.evaluation.price.model.PriceResponse;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceService {

  private final JdbcTemplate jdbcTemplate;

  public PriceService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<PriceResponse> list() {
    return jdbcTemplate.query(
        """
        SELECT id, asset_category, asset_name, specification, unit, base_price,
               effective_date, expiry_date, remark
        FROM price_library
        WHERE deleted = 0
        ORDER BY id DESC
        """,
        (rs, rowNum) -> new PriceResponse(
            rs.getLong("id"),
            rs.getString("asset_category"),
            rs.getString("asset_name"),
            rs.getString("specification"),
            rs.getString("unit"),
            rs.getBigDecimal("base_price"),
            asString(rs.getDate("effective_date")),
            asString(rs.getDate("expiry_date")),
            rs.getString("remark")
        )
    );
  }

  @Transactional
  public PriceResponse create(PriceRequest request) {
    Long id = jdbcTemplate.queryForObject(
        """
        INSERT INTO price_library (
          asset_category, asset_name, specification, unit, base_price,
          effective_date, expiry_date, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        """,
        Long.class,
        request.assetCategory(),
        request.assetName(),
        request.specification(),
        request.unit(),
        request.basePrice(),
        asDate(request.effectiveDate()),
        asDate(request.expiryDate()),
        request.remark()
    );
    if (id == null) {
      throw new IllegalArgumentException("价格项创建失败");
    }
    return getById(id);
  }

  @Transactional
  public PriceResponse update(Long id, PriceRequest request) {
    ensureExists(id);
    jdbcTemplate.update(
        """
        UPDATE price_library
        SET asset_category = ?,
            asset_name = ?,
            specification = ?,
            unit = ?,
            base_price = ?,
            effective_date = ?,
            expiry_date = ?,
            remark = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        """,
        request.assetCategory(),
        request.assetName(),
        request.specification(),
        request.unit(),
        request.basePrice(),
        asDate(request.effectiveDate()),
        asDate(request.expiryDate()),
        request.remark(),
        id
    );
    return getById(id);
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    jdbcTemplate.update("UPDATE price_library SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private PriceResponse getById(Long id) {
    List<PriceResponse> results = jdbcTemplate.query(
        """
        SELECT id, asset_category, asset_name, specification, unit, base_price,
               effective_date, expiry_date, remark
        FROM price_library
        WHERE id = ? AND deleted = 0
        """,
        (rs, rowNum) -> new PriceResponse(
            rs.getLong("id"),
            rs.getString("asset_category"),
            rs.getString("asset_name"),
            rs.getString("specification"),
            rs.getString("unit"),
            rs.getBigDecimal("base_price"),
            asString(rs.getDate("effective_date")),
            asString(rs.getDate("expiry_date")),
            rs.getString("remark")
        ),
        id
    );
    if (results.isEmpty()) {
      throw new IllegalArgumentException("价格项不存在: " + id);
    }
    return results.get(0);
  }

  private void ensureExists(Long id) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM price_library WHERE id = ? AND deleted = 0",
        Integer.class,
        id
    );
    if (count == null || count == 0) {
      throw new IllegalArgumentException("价格项不存在: " + id);
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
