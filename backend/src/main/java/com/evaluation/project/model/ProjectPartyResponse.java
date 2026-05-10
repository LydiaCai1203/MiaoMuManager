package com.evaluation.project.model;

public record ProjectPartyResponse(
    Long id,
    Long projectId,
    PartyType partyType,
    String partyName,
    String idNo,
    String contactPhone,
    String villageGroup,
    String tenantName,
    String locationText,
    String remark
) {
}
