package com.evaluation.project.controller;

import com.evaluation.common.api.ApiResponse;
import com.evaluation.project.model.ProjectPartyRequest;
import com.evaluation.project.model.ProjectPartyResponse;
import com.evaluation.project.model.ProjectRequest;
import com.evaluation.project.model.ProjectResponse;
import com.evaluation.project.service.ProjectService;
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
@RequestMapping("/api/projects")
public class ProjectController {

  private final ProjectService projectService;

  public ProjectController(ProjectService projectService) {
    this.projectService = projectService;
  }

  @GetMapping
  public ApiResponse<List<ProjectResponse>> list() {
    return ApiResponse.success(projectService.listProjects());
  }

  @GetMapping("/{id}")
  public ApiResponse<ProjectResponse> detail(@PathVariable Long id) {
    return ApiResponse.success(projectService.getProject(id));
  }

  @PostMapping
  public ApiResponse<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
    return ApiResponse.success(projectService.createProject(request));
  }

  @PutMapping("/{id}")
  public ApiResponse<ProjectResponse> update(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
    return ApiResponse.success(projectService.updateProject(id, request));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Boolean> delete(@PathVariable Long id) {
    projectService.deleteProject(id);
    return ApiResponse.success(true);
  }

  @GetMapping("/{id}/parties")
  public ApiResponse<List<ProjectPartyResponse>> listParties(@PathVariable Long id) {
    return ApiResponse.success(projectService.listParties(id));
  }

  @PostMapping("/{id}/parties")
  public ApiResponse<ProjectPartyResponse> createParty(@PathVariable Long id, @Valid @RequestBody ProjectPartyRequest request) {
    return ApiResponse.success(projectService.createParty(id, request));
  }

  @PutMapping("/{projectId}/parties/{partyId}")
  public ApiResponse<ProjectPartyResponse> updateParty(
      @PathVariable Long projectId,
      @PathVariable Long partyId,
      @Valid @RequestBody ProjectPartyRequest request
  ) {
    return ApiResponse.success(projectService.updateParty(projectId, partyId, request));
  }

  @DeleteMapping("/{projectId}/parties/{partyId}")
  public ApiResponse<Boolean> deleteParty(@PathVariable Long projectId, @PathVariable Long partyId) {
    projectService.deleteParty(projectId, partyId);
    return ApiResponse.success(true);
  }
}
