package com.evaluation.price.controller;

import com.evaluation.common.api.ApiResponse;
import com.evaluation.price.model.PriceRequest;
import com.evaluation.price.model.PriceResponse;
import com.evaluation.price.service.PriceService;
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
@RequestMapping("/api/prices")
public class PriceController {

  private final PriceService priceService;

  public PriceController(PriceService priceService) {
    this.priceService = priceService;
  }

  @GetMapping
  public ApiResponse<List<PriceResponse>> list() {
    return ApiResponse.success(priceService.list());
  }

  @PostMapping
  public ApiResponse<PriceResponse> create(@Valid @RequestBody PriceRequest request) {
    return ApiResponse.success(priceService.create(request));
  }

  @PutMapping("/{id}")
  public ApiResponse<PriceResponse> update(@PathVariable Long id, @Valid @RequestBody PriceRequest request) {
    return ApiResponse.success(priceService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    priceService.delete(id);
    return ApiResponse.success(true);
  }
}
