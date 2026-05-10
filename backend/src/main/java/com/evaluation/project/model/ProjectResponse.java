package com.evaluation.project.model;

import java.util.List;

public record ProjectResponse(
    Long id,
    String projectCode,
    String projectName,
    String projectType,
    String entrustingParty,
    String regionName,
    String benchmarkDate,
    String surveyDate,
    ProjectStatus status,
    String remark,
    List<ProjectPartyResponse> parties
) {
}
