package com.evaluation.importtask.model;

public record ImportResult(
    String templateType,
    int createdCount,
    String message
) {
}
