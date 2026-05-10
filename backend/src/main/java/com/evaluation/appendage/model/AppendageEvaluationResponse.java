package com.evaluation.appendage.model;

import java.math.BigDecimal;
import java.util.List;

public record AppendageEvaluationResponse(
    Long id,
    Long projectId,
    Long partyId,
    String evaluationNo,
    String tenantName,
    String locationText,
    String benchmarkDate,
    String surveyDate,
    BigDecimal structureAmount,
    BigDecimal equipmentMoveAmount,
    BigDecimal seedlingMoveAmount,
    BigDecimal totalAmount,
    String status,
    String remark,
    List<AppendageEvaluationItemResponse> items
) {
}
