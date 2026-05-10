package com.evaluation.auth.model;

import jakarta.validation.constraints.NotBlank;

public record UserRequest(
    @NotBlank(message = "用户名不能为空") String username,
    @NotBlank(message = "姓名不能为空") String realName,
    String phone,
    @NotBlank(message = "状态不能为空") String status
) {
}
