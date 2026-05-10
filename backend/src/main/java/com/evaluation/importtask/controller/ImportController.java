package com.evaluation.importtask.controller;

import com.evaluation.importtask.model.ImportResult;
import com.evaluation.importtask.service.ImportService;
import com.evaluation.importtask.service.TemplateService;
import com.evaluation.common.api.ApiResponse;
import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ImportController {

  private final TemplateService templateService;
  private final ImportService importService;

  public ImportController(TemplateService templateService, ImportService importService) {
    this.templateService = templateService;
    this.importService = importService;
  }

  @GetMapping("/templates/seedling")
  public ResponseEntity<Resource> downloadSeedlingTemplate() throws IOException {
    return templateService.downloadSeedlingTemplate();
  }

  @GetMapping("/templates/appendage")
  public ResponseEntity<Resource> downloadAppendageTemplate() throws IOException {
    return templateService.downloadAppendageTemplate();
  }

  @PostMapping("/import/seedling")
  public ApiResponse<ImportResult> importSeedling(
      @RequestParam Long projectId,
      @RequestParam Long partyId,
      @RequestParam MultipartFile file
  ) throws IOException {
    return ApiResponse.success(importService.importSeedling(projectId, partyId, file));
  }

  @PostMapping("/import/appendage")
  public ApiResponse<ImportResult> importAppendage(
      @RequestParam Long projectId,
      @RequestParam Long partyId,
      @RequestParam MultipartFile file
  ) throws IOException {
    return ApiResponse.success(importService.importAppendage(projectId, partyId, file));
  }
}
