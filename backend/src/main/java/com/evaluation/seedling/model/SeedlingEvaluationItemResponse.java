package com.evaluation.seedling.model;

import java.math.BigDecimal;

public record SeedlingEvaluationItemResponse(
    Long id,
    Long evaluationId,
    Integer lineNo,
    String seedlingName,
    String specification,
    String unit,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal amount,
    String remark
) {
}
