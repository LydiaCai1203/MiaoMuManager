package com.evaluation.configoption.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OptionItemRequest(
    @NotBlank(message = "分组编码不能为空") String groupCode,
    @NotBlank(message = "选项值不能为空") String optionValue,
    @NotBlank(message = "选项名称不能为空") String optionLabel,
    @NotNull(message = "排序不能为空") Integer sortOrder,
    @NotNull(message = "启用状态不能为空") Boolean enabled,
    String remark
) {
}
