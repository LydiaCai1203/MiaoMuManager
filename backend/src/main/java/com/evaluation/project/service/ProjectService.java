package com.evaluation.project.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.project.entity.EvaluationParty;
import com.evaluation.project.entity.EvaluationProject;
import com.evaluation.project.mapper.EvaluationPartyMapper;
import com.evaluation.project.mapper.EvaluationProjectMapper;
import com.evaluation.project.model.PartyType;
import com.evaluation.project.model.ProjectPartyRequest;
import com.evaluation.project.model.ProjectPartyResponse;
import com.evaluation.project.model.ProjectRequest;
import com.evaluation.project.model.ProjectResponse;
import com.evaluation.project.model.ProjectStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

  private final EvaluationProjectMapper projectMapper;
  private final EvaluationPartyMapper partyMapper;

  public ProjectService(EvaluationProjectMapper projectMapper, EvaluationPartyMapper partyMapper) {
    this.projectMapper = projectMapper;
    this.partyMapper = partyMapper;
  }

  public List<ProjectResponse> listProjects() {
    List<EvaluationProject> entities = projectMapper.selectList(
        new LambdaQueryWrapper<EvaluationProject>().orderByAsc(EvaluationProject::getId)
    );
    return entities.stream().map(e -> toProjectResponse(e, true)).toList();
  }

  public ProjectResponse getProject(Long id) {
    EvaluationProject entity = projectMapper.selectById(id);
    if (entity == null) {
      throw new IllegalArgumentException("项目不存在: " + id);
    }
    return toProjectResponse(entity, true);
  }

  @Transactional
  public ProjectResponse createProject(ProjectRequest request) {
    EvaluationProject entity = new EvaluationProject();
    entity.setProjectCode(request.projectCode());
    entity.setProjectName(request.projectName());
    entity.setProjectType(request.projectType());
    entity.setEntrustingParty(request.entrustingParty());
    entity.setRegionName(request.regionName());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setStatus(request.status().name());
    entity.setRemark(request.remark());
    projectMapper.insert(entity);
    return getProject(entity.getId());
  }

  @Transactional
  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    getProject(id);
    EvaluationProject entity = new EvaluationProject();
    entity.setId(id);
    entity.setProjectCode(request.projectCode());
    entity.setProjectName(request.projectName());
    entity.setProjectType(request.projectType());
    entity.setEntrustingParty(request.entrustingParty());
    entity.setRegionName(request.regionName());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setStatus(request.status().name());
    entity.setRemark(request.remark());
    projectMapper.updateById(entity);
    return getProject(id);
  }

  @Transactional
  public void deleteProject(Long id) {
    getProject(id);
    partyMapper.delete(new LambdaQueryWrapper<EvaluationParty>()
        .eq(EvaluationParty::getProjectId, id));
    projectMapper.deleteById(id);
  }

  public List<ProjectPartyResponse> listParties(Long projectId) {
    getProject(projectId);
    List<EvaluationParty> entities = partyMapper.selectList(
        new LambdaQueryWrapper<EvaluationParty>()
            .eq(EvaluationParty::getProjectId, projectId)
            .orderByAsc(EvaluationParty::getId)
    );
    return entities.stream().map(this::toPartyResponse).toList();
  }

  @Transactional
  public ProjectPartyResponse createParty(Long projectId, ProjectPartyRequest request) {
    getProject(projectId);
    EvaluationParty entity = new EvaluationParty();
    entity.setProjectId(projectId);
    entity.setPartyType(request.partyType().name());
    entity.setPartyName(request.partyName());
    entity.setIdNo(request.idNo());
    entity.setContactPhone(request.contactPhone());
    entity.setVillageGroup(request.villageGroup());
    entity.setTenantName(request.tenantName());
    entity.setLocationText(request.locationText());
    entity.setRemark(request.remark());
    partyMapper.insert(entity);
    return toPartyResponse(partyMapper.selectById(entity.getId()));
  }

  @Transactional
  public ProjectPartyResponse updateParty(Long projectId, Long partyId, ProjectPartyRequest request) {
    ensurePartyExists(projectId, partyId);
    EvaluationParty entity = new EvaluationParty();
    entity.setId(partyId);
    entity.setPartyType(request.partyType().name());
    entity.setPartyName(request.partyName());
    entity.setIdNo(request.idNo());
    entity.setContactPhone(request.contactPhone());
    entity.setVillageGroup(request.villageGroup());
    entity.setTenantName(request.tenantName());
    entity.setLocationText(request.locationText());
    entity.setRemark(request.remark());
    partyMapper.updateById(entity);
    return toPartyResponse(partyMapper.selectById(partyId));
  }

  @Transactional
  public void deleteParty(Long projectId, Long partyId) {
    ensurePartyExists(projectId, partyId);
    partyMapper.deleteById(partyId);
  }

  private ProjectResponse toProjectResponse(EvaluationProject entity, boolean includeParties) {
    return new ProjectResponse(
        entity.getId(),
        entity.getProjectCode(),
        entity.getProjectName(),
        entity.getProjectType(),
        entity.getEntrustingParty(),
        entity.getRegionName(),
        entity.getBenchmarkDate() == null ? null : entity.getBenchmarkDate().toString(),
        entity.getSurveyDate() == null ? null : entity.getSurveyDate().toString(),
        ProjectStatus.valueOf(entity.getStatus()),
        entity.getRemark(),
        includeParties ? listParties(entity.getId()) : List.of()
    );
  }

  private ProjectPartyResponse toPartyResponse(EvaluationParty entity) {
    return new ProjectPartyResponse(
        entity.getId(),
        entity.getProjectId(),
        PartyType.valueOf(entity.getPartyType()),
        entity.getPartyName(),
        entity.getIdNo(),
        entity.getContactPhone(),
        entity.getVillageGroup(),
        entity.getTenantName(),
        entity.getLocationText(),
        entity.getRemark()
    );
  }

  private void ensurePartyExists(Long projectId, Long partyId) {
    getProject(projectId);
    EvaluationParty party = partyMapper.selectOne(
        new LambdaQueryWrapper<EvaluationParty>()
            .eq(EvaluationParty::getId, partyId)
            .eq(EvaluationParty::getProjectId, projectId)
    );
    if (party == null) {
      throw new IllegalArgumentException("对象不存在: " + partyId);
    }
  }

  private LocalDate parseDate(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LocalDate.parse(value);
  }
}
