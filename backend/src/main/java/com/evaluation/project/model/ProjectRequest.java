package com.evaluation.project.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectRequest(
    @NotBlank(message = "项目编号不能为空") String projectCode,
    @NotBlank(message = "项目名称不能为空") String projectName,
    @NotBlank(message = "项目类型不能为空") String projectType,
    String entrustingParty,
    String regionName,
    String benchmarkDate,
    String surveyDate,
    @NotNull(message = "项目状态不能为空") ProjectStatus status,
    String remark
) {
}
