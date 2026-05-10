package com.evaluation.configoption.controller;

import com.evaluation.common.api.ApiResponse;
import com.evaluation.configoption.model.OptionItemRequest;
import com.evaluation.configoption.model.OptionItemResponse;
import com.evaluation.configoption.service.OptionItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OptionItemController {

  private final OptionItemService optionItemService;

  public OptionItemController(OptionItemService optionItemService) {
    this.optionItemService = optionItemService;
  }

  @GetMapping("/api/options/{groupCode}")
  public ApiResponse<List<OptionItemResponse>> listEnabled(@PathVariable String groupCode) {
    return ApiResponse.success(optionItemService.listEnabledByGroup(groupCode.toUpperCase()));
  }

  @GetMapping("/api/system/options")
  public ApiResponse<List<OptionItemResponse>> listAll(@RequestParam(required = false) String groupCode) {
    return ApiResponse.success(optionItemService.listAll(groupCode == null ? null : groupCode.toUpperCase()));
  }

  @PostMapping("/api/system/options")
  public ApiResponse<OptionItemResponse> create(@Valid @RequestBody OptionItemRequest request) {
    return ApiResponse.success(optionItemService.create(request));
  }

  @PutMapping("/api/system/options/{id}")
  public ApiResponse<OptionItemResponse> update(@PathVariable Long id, @Valid @RequestBody OptionItemRequest request) {
    return ApiResponse.success(optionItemService.update(id, request));
  }

  @DeleteMapping("/api/system/options/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    optionItemService.delete(id);
    return ApiResponse.success(true);
  }
}
