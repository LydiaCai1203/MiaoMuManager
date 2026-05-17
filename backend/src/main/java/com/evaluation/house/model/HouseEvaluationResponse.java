package com.evaluation.house.model;

import java.math.BigDecimal;

public record HouseEvaluationResponse(
    Long id,
    Long projectId,
    Long partyId,
    String evaluationNo,
    String locationText,
    String usageType,
    BigDecimal buildingArea,
    BigDecimal unitPrice,
    BigDecimal regionFactor,
    BigDecimal floorFactor,
    BigDecimal orientationFactor,
    BigDecimal decorationFactor,
    BigDecimal totalAmount,
    BigDecimal suggestedUnitPrice,
    Integer priceAdjusted,
    String benchmarkDate,
    String surveyDate,
    String status,
    String remark
) {
}
