package com.evaluation.auth.model;

public record UserResponse(
    Long id,
    String username,
    String realName,
    String phone,
    String status
) {
}
