package com.evaluation.seedling.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SeedlingEvaluationItemRequest(
    @NotNull(message = "序号不能为空") Integer lineNo,
    @NotBlank(message = "苗木名称不能为空") String seedlingName,
    String specification,
    String unit,
    @NotNull(message = "数量不能为空") @DecimalMin(value = "0.0", inclusive = false, message = "数量必须大于 0") BigDecimal quantity,
    @NotNull(message = "单价不能为空") @DecimalMin(value = "0.0", inclusive = true, message = "单价不能小于 0") BigDecimal unitPrice,
    @NotNull(message = "金额不能为空") @DecimalMin(value = "0.0", inclusive = true, message = "金额不能小于 0") BigDecimal amount,
    String remark
) {
}
