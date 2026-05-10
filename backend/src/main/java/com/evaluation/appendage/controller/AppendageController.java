package com.evaluation.appendage.controller;

import com.evaluation.appendage.model.AppendageEvaluationRequest;
import com.evaluation.appendage.model.AppendageEvaluationResponse;
import com.evaluation.appendage.service.AppendageService;
import com.evaluation.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appendage-evaluations")
public class AppendageController {

  private final AppendageService appendageService;

  public AppendageController(AppendageService appendageService) {
    this.appendageService = appendageService;
  }

  @GetMapping
  public ApiResponse<List<AppendageEvaluationResponse>> list() {
    return ApiResponse.success(appendageService.list());
  }

  @GetMapping("/{id}")
  public ApiResponse<AppendageEvaluationResponse> detail(@PathVariable Long id) {
    return ApiResponse.success(appendageService.detail(id));
  }

  @PostMapping
  public ApiResponse<AppendageEvaluationResponse> create(@Valid @RequestBody AppendageEvaluationRequest request) {
    return ApiResponse.success(appendageService.create(request));
  }

  @PutMapping("/{id}")
  public ApiResponse<AppendageEvaluationResponse> update(@PathVariable Long id, @Valid @RequestBody AppendageEvaluationRequest request) {
    return ApiResponse.success(appendageService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    appendageService.delete(id);
    return ApiResponse.success(true);
  }
}
