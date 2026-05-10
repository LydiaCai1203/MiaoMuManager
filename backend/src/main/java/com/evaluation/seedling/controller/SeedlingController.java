package com.evaluation.seedling.controller;

import com.evaluation.common.api.ApiResponse;
import com.evaluation.seedling.model.SeedlingEvaluationRequest;
import com.evaluation.seedling.model.SeedlingEvaluationResponse;
import com.evaluation.seedling.service.SeedlingService;
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
@RequestMapping("/api/seedling-evaluations")
public class SeedlingController {

  private final SeedlingService seedlingService;

  public SeedlingController(SeedlingService seedlingService) {
    this.seedlingService = seedlingService;
  }

  @GetMapping
  public ApiResponse<List<SeedlingEvaluationResponse>> list() {
    return ApiResponse.success(seedlingService.list());
  }

  @GetMapping("/{id}")
  public ApiResponse<SeedlingEvaluationResponse> detail(@PathVariable Long id) {
    return ApiResponse.success(seedlingService.detail(id));
  }

  @PostMapping
  public ApiResponse<SeedlingEvaluationResponse> create(@Valid @RequestBody SeedlingEvaluationRequest request) {
    return ApiResponse.success(seedlingService.create(request));
  }

  @PutMapping("/{id}")
  public ApiResponse<SeedlingEvaluationResponse> update(@PathVariable Long id, @Valid @RequestBody SeedlingEvaluationRequest request) {
    return ApiResponse.success(seedlingService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    seedlingService.delete(id);
    return ApiResponse.success(true);
  }
}
