package com.evaluation.configoption.model;

public record OptionItemResponse(
    Long id,
    String groupCode,
    String optionValue,
    String optionLabel,
    Integer sortOrder,
    Boolean enabled,
    String remark
) {
}
