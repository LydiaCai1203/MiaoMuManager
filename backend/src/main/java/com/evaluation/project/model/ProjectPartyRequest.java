package com.evaluation.project.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectPartyRequest(
    @NotNull(message = "对象类型不能为空") PartyType partyType,
    @NotBlank(message = "对象名称不能为空") String partyName,
    String idNo,
    String contactPhone,
    String villageGroup,
    String tenantName,
    String locationText,
    String remark
) {
}
