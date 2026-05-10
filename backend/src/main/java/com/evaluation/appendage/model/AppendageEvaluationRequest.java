package com.evaluation.appendage.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AppendageEvaluationRequest(
    @NotNull(message = "项目不能为空") Long projectId,
    @NotNull(message = "被评估对象不能为空") Long partyId,
    @NotBlank(message = "评估单编号不能为空") String evaluationNo,
    String tenantName,
    String locationText,
    String benchmarkDate,
    String surveyDate,
    @NotBlank(message = "状态不能为空") String status,
    String remark,
    @Valid @NotEmpty(message = "附属物明细不能为空") List<AppendageEvaluationItemRequest> items
) {
}
