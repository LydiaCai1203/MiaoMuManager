package com.evaluation.appendage.model;

import java.math.BigDecimal;

public record AppendageEvaluationItemResponse(
    Long id,
    Long evaluationId,
    String assetType,
    String assetCode,
    Integer lineNo,
    String itemName,
    String specification,
    String unit,
    BigDecimal quantity,
    BigDecimal replacementUnitPrice,
    BigDecimal replacementAmount,
    BigDecimal noveltyRate,
    BigDecimal evaluationUnitPrice,
    BigDecimal evaluationAmount,
    String remark
) {
}
