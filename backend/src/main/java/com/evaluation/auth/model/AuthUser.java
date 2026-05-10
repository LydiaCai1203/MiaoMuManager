package com.evaluation.auth.model;

public record AuthUser(
    String username,
    String realName,
    String roleCode
) {
}
