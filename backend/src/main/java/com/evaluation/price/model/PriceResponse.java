package com.evaluation.price.model;

import java.math.BigDecimal;

public record PriceResponse(
    Long id,
    String assetCategory,
    String assetName,
    String specification,
    String unit,
    BigDecimal basePrice,
    String effectiveDate,
    String expiryDate,
    String remark
) {
}
