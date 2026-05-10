package com.evaluation.seedling.model;

import java.math.BigDecimal;
import java.util.List;

public record SeedlingEvaluationResponse(
    Long id,
    Long projectId,
    Long partyId,
    String evaluationNo,
    String benchmarkDate,
    String surveyDate,
    BigDecimal totalAmount,
    String status,
    String remark,
    List<SeedlingEvaluationItemResponse> items
) {
}
