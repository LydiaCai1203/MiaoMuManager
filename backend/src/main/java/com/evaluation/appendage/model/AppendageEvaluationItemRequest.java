package com.evaluation.appendage.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AppendageEvaluationItemRequest(
    @NotBlank(message = "资产分类不能为空") String assetType,
    String assetCode,
    @NotNull(message = "序号不能为空") Integer lineNo,
    @NotBlank(message = "名称不能为空") String itemName,
    String specification,
    String unit,
    @NotNull(message = "数量不能为空") @DecimalMin(value = "0.0", inclusive = false, message = "数量必须大于 0") BigDecimal quantity,
    BigDecimal replacementUnitPrice,
    BigDecimal replacementAmount,
    BigDecimal noveltyRate,
    BigDecimal evaluationUnitPrice,
    @NotNull(message = "评估值不能为空") @DecimalMin(value = "0.0", inclusive = true, message = "评估值不能小于 0") BigDecimal evaluationAmount,
    String remark
) {
}
