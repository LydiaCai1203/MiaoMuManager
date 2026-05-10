package com.evaluation.price.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PriceRequest(
    @NotBlank(message = "资产分类不能为空") String assetCategory,
    @NotBlank(message = "资产名称不能为空") String assetName,
    String specification,
    String unit,
    @NotNull(message = "基准价格不能为空") @DecimalMin(value = "0.0", inclusive = false, message = "基准价格必须大于 0") BigDecimal basePrice,
    String effectiveDate,
    String expiryDate,
    String remark
) {
}
