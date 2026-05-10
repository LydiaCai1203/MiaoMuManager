package com.evaluation.importtask.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class TemplateService {

  private static final Path WORKSPACE_ROOT = Path.of("/workspace");

  public ResponseEntity<Resource> downloadSeedlingTemplate() throws IOException {
    return download("苗木模板.xlsx");
  }

  public ResponseEntity<Resource> downloadAppendageTemplate() throws IOException {
    return download("附属物评估模板.xlsx");
  }

  private ResponseEntity<Resource> download(String fileName) throws IOException {
    Path filePath = WORKSPACE_ROOT.resolve(fileName);
    byte[] content = Files.readAllBytes(filePath);
    ByteArrayResource resource = new ByteArrayResource(content);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + java.net.URLEncoder.encode(fileName, java.nio.charset.StandardCharsets.UTF_8))
        .contentLength(content.length)
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(resource);
  }
}
