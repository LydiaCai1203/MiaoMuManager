package com.evaluation.house.controller;

import com.evaluation.common.api.ApiResponse;
import com.evaluation.house.model.HouseEvaluationRequest;
import com.evaluation.house.model.HouseEvaluationResponse;
import com.evaluation.house.service.HouseService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/house-evaluations")
public class HouseController {

  private final HouseService houseService;

  public HouseController(HouseService houseService) {
    this.houseService = houseService;
  }

  @GetMapping
  public ApiResponse<List<HouseEvaluationResponse>> list() {
    return ApiResponse.success(houseService.list());
  }

  @GetMapping("/{id}")
  public ApiResponse<HouseEvaluationResponse> detail(@PathVariable Long id) {
    return ApiResponse.success(houseService.detail(id));
  }

  @PostMapping
  public ApiResponse<HouseEvaluationResponse> create(@Valid @RequestBody HouseEvaluationRequest request) {
    return ApiResponse.success(houseService.create(request));
  }

  @PutMapping("/{id}")
  public ApiResponse<HouseEvaluationResponse> update(@PathVariable Long id, @Valid @RequestBody HouseEvaluationRequest request) {
    return ApiResponse.success(houseService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    houseService.delete(id);
    return ApiResponse.success(true);
  }
}
