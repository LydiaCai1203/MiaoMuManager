package com.evaluation.appendage.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.appendage.entity.AppendageEvaluationEntity;
import com.evaluation.appendage.entity.AppendageEvaluationItemEntity;
import com.evaluation.appendage.mapper.AppendageEvaluationItemMapper;
import com.evaluation.appendage.mapper.AppendageEvaluationMapper;
import com.evaluation.appendage.model.AppendageEvaluationItemRequest;
import com.evaluation.appendage.model.AppendageEvaluationItemResponse;
import com.evaluation.appendage.model.AppendageEvaluationRequest;
import com.evaluation.appendage.model.AppendageEvaluationResponse;
import com.evaluation.project.mapper.EvaluationPartyMapper;
import com.evaluation.project.mapper.EvaluationProjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppendageService {

  private static final String STRUCTURE = "STRUCTURE";
  private static final String EQUIPMENT_MOVE = "EQUIPMENT_MOVE";
  private static final String SEEDLING_MOVE = "SEEDLING_MOVE";

  private final AppendageEvaluationMapper evaluationMapper;
  private final AppendageEvaluationItemMapper itemMapper;
  private final EvaluationProjectMapper projectMapper;
  private final EvaluationPartyMapper partyMapper;

  public AppendageService(AppendageEvaluationMapper evaluationMapper,
                          AppendageEvaluationItemMapper itemMapper,
                          EvaluationProjectMapper projectMapper,
                          EvaluationPartyMapper partyMapper) {
    this.evaluationMapper = evaluationMapper;
    this.itemMapper = itemMapper;
    this.projectMapper = projectMapper;
    this.partyMapper = partyMapper;
  }

  public List<AppendageEvaluationResponse> list() {
    List<AppendageEvaluationEntity> entities = evaluationMapper.selectList(
        new LambdaQueryWrapper<AppendageEvaluationEntity>().orderByDesc(AppendageEvaluationEntity::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  public AppendageEvaluationResponse detail(Long id) {
    AppendageEvaluationEntity entity = evaluationMapper.selectById(id);
    if (entity == null) {
      throw new IllegalArgumentException("附属物评估单不存在: " + id);
    }
    return toResponse(entity);
  }

  @Transactional
  public AppendageEvaluationResponse create(AppendageEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal structureAmount = sumByType(request.items(), STRUCTURE);
    BigDecimal equipmentMoveAmount = sumByType(request.items(), EQUIPMENT_MOVE);
    BigDecimal seedlingMoveAmount = sumByType(request.items(), SEEDLING_MOVE);
    BigDecimal totalAmount = structureAmount.add(equipmentMoveAmount).add(seedlingMoveAmount);

    AppendageEvaluationEntity entity = new AppendageEvaluationEntity();
    entity.setProjectId(request.projectId());
    entity.setPartyId(request.partyId());
    entity.setEvaluationNo(request.evaluationNo());
    entity.setTenantName(request.tenantName());
    entity.setLocationText(request.locationText());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setStructureAmount(structureAmount);
    entity.setEquipmentMoveAmount(equipmentMoveAmount);
    entity.setSeedlingMoveAmount(seedlingMoveAmount);
    entity.setTotalAmount(totalAmount);
    entity.setStatus(request.status());
    entity.setRemark(request.remark());
    evaluationMapper.insert(entity);

    saveItems(entity.getId(), request.items());
    return detail(entity.getId());
  }

  @Transactional
  public AppendageEvaluationResponse update(Long id, AppendageEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal structureAmount = sumByType(request.items(), STRUCTURE);
    BigDecimal equipmentMoveAmount = sumByType(request.items(), EQUIPMENT_MOVE);
    BigDecimal seedlingMoveAmount = sumByType(request.items(), SEEDLING_MOVE);
    BigDecimal totalAmount = structureAmount.add(equipmentMoveAmount).add(seedlingMoveAmount);

    AppendageEvaluationEntity entity = new AppendageEvaluationEntity();
    entity.setId(id);
    entity.setProjectId(request.projectId());
    entity.setPartyId(request.partyId());
    entity.setEvaluationNo(request.evaluationNo());
    entity.setTenantName(request.tenantName());
    entity.setLocationText(request.locationText());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setStructureAmount(structureAmount);
    entity.setEquipmentMoveAmount(equipmentMoveAmount);
    entity.setSeedlingMoveAmount(seedlingMoveAmount);
    entity.setTotalAmount(totalAmount);
    entity.setStatus(request.status());
    entity.setRemark(request.remark());
    evaluationMapper.updateById(entity);

    // Soft-delete old items then re-insert
    itemMapper.delete(new LambdaQueryWrapper<AppendageEvaluationItemEntity>()
        .eq(AppendageEvaluationItemEntity::getEvaluationId, id));
    saveItems(id, request.items());
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    itemMapper.delete(new LambdaQueryWrapper<AppendageEvaluationItemEntity>()
        .eq(AppendageEvaluationItemEntity::getEvaluationId, id));
    evaluationMapper.deleteById(id);
  }

  private void saveItems(Long evaluationId, List<AppendageEvaluationItemRequest> items) {
    for (AppendageEvaluationItemRequest item : items) {
      AppendageEvaluationItemEntity entity = new AppendageEvaluationItemEntity();
      entity.setEvaluationId(evaluationId);
      entity.setAssetType(item.assetType());
      entity.setAssetCode(item.assetCode());
      entity.setLineNo(item.lineNo());
      entity.setItemName(item.itemName());
      entity.setSpecification(item.specification());
      entity.setUnit(item.unit());
      entity.setQuantity(item.quantity());
      entity.setReplacementUnitPrice(item.replacementUnitPrice());
      entity.setReplacementAmount(item.replacementAmount());
      entity.setNoveltyRate(item.noveltyRate());
      entity.setEvaluationUnitPrice(item.evaluationUnitPrice());
      entity.setEvaluationAmount(item.evaluationAmount());
      entity.setRemark(item.remark());
      itemMapper.insert(entity);
    }
  }

  private List<AppendageEvaluationItemResponse> listItems(Long evaluationId) {
    List<AppendageEvaluationItemEntity> items = itemMapper.selectList(
        new LambdaQueryWrapper<AppendageEvaluationItemEntity>()
            .eq(AppendageEvaluationItemEntity::getEvaluationId, evaluationId)
            .orderByAsc(AppendageEvaluationItemEntity::getAssetType)
            .orderByAsc(AppendageEvaluationItemEntity::getLineNo)
    );
    return items.stream().map(e -> new AppendageEvaluationItemResponse(
        e.getId(), e.getEvaluationId(), e.getAssetType(), e.getAssetCode(),
        e.getLineNo(), e.getItemName(), e.getSpecification(), e.getUnit(),
        e.getQuantity(), e.getReplacementUnitPrice(), e.getReplacementAmount(),
        e.getNoveltyRate(), e.getEvaluationUnitPrice(), e.getEvaluationAmount(),
        e.getRemark()
    )).toList();
  }

  private AppendageEvaluationResponse toResponse(AppendageEvaluationEntity entity) {
    return new AppendageEvaluationResponse(
        entity.getId(),
        entity.getProjectId(),
        entity.getPartyId(),
        entity.getEvaluationNo(),
        entity.getTenantName(),
        entity.getLocationText(),
        entity.getBenchmarkDate() == null ? null : entity.getBenchmarkDate().toString(),
        entity.getSurveyDate() == null ? null : entity.getSurveyDate().toString(),
        entity.getStructureAmount(),
        entity.getEquipmentMoveAmount(),
        entity.getSeedlingMoveAmount(),
        entity.getTotalAmount(),
        entity.getStatus(),
        entity.getRemark(),
        listItems(entity.getId())
    );
  }

  private BigDecimal sumByType(List<AppendageEvaluationItemRequest> items, String assetType) {
    return items.stream()
        .filter(item -> assetType.equals(item.assetType()))
        .map(AppendageEvaluationItemRequest::evaluationAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private void ensureProjectExists(Long projectId) {
    if (projectMapper.selectById(projectId) == null) {
      throw new IllegalArgumentException("项目不存在: " + projectId);
    }
  }

  private void ensurePartyExists(Long projectId, Long partyId) {
    if (partyMapper.selectById(partyId) == null) {
      throw new IllegalArgumentException("被评估对象不存在: " + partyId);
    }
  }

  private LocalDate parseDate(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LocalDate.parse(value);
  }
}
