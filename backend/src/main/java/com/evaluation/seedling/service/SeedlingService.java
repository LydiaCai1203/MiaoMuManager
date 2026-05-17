package com.evaluation.seedling.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.evaluation.project.mapper.EvaluationPartyMapper;
import com.evaluation.project.mapper.EvaluationProjectMapper;
import com.evaluation.seedling.entity.SeedlingEvaluationEntity;
import com.evaluation.seedling.entity.SeedlingEvaluationItemEntity;
import com.evaluation.seedling.mapper.SeedlingEvaluationItemMapper;
import com.evaluation.seedling.mapper.SeedlingEvaluationMapper;
import com.evaluation.seedling.model.SeedlingEvaluationItemRequest;
import com.evaluation.seedling.model.SeedlingEvaluationItemResponse;
import com.evaluation.seedling.model.SeedlingEvaluationRequest;
import com.evaluation.seedling.model.SeedlingEvaluationResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SeedlingService {

  private final SeedlingEvaluationMapper evaluationMapper;
  private final SeedlingEvaluationItemMapper itemMapper;
  private final EvaluationProjectMapper projectMapper;
  private final EvaluationPartyMapper partyMapper;

  public SeedlingService(SeedlingEvaluationMapper evaluationMapper,
                         SeedlingEvaluationItemMapper itemMapper,
                         EvaluationProjectMapper projectMapper,
                         EvaluationPartyMapper partyMapper) {
    this.evaluationMapper = evaluationMapper;
    this.itemMapper = itemMapper;
    this.projectMapper = projectMapper;
    this.partyMapper = partyMapper;
  }

  public List<SeedlingEvaluationResponse> list() {
    List<SeedlingEvaluationEntity> entities = evaluationMapper.selectList(
        new LambdaQueryWrapper<SeedlingEvaluationEntity>().orderByDesc(SeedlingEvaluationEntity::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  public SeedlingEvaluationResponse detail(Long id) {
    SeedlingEvaluationEntity entity = evaluationMapper.selectById(id);
    if (entity == null) {
      throw new IllegalArgumentException("苗木评估单不存在: " + id);
    }
    return toResponse(entity);
  }

  @Transactional
  public SeedlingEvaluationResponse create(SeedlingEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal totalAmount = request.items().stream()
        .map(SeedlingEvaluationItemRequest::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    SeedlingEvaluationEntity entity = new SeedlingEvaluationEntity();
    entity.setProjectId(request.projectId());
    entity.setPartyId(request.partyId());
    entity.setEvaluationNo(request.evaluationNo());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setTotalAmount(totalAmount);
    entity.setStatus(request.status());
    entity.setRemark(request.remark());
    evaluationMapper.insert(entity);

    saveItems(entity.getId(), request.items());
    return detail(entity.getId());
  }

  @Transactional
  public SeedlingEvaluationResponse update(Long id, SeedlingEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());

    BigDecimal totalAmount = request.items().stream()
        .map(SeedlingEvaluationItemRequest::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    SeedlingEvaluationEntity entity = new SeedlingEvaluationEntity();
    entity.setId(id);
    entity.setProjectId(request.projectId());
    entity.setPartyId(request.partyId());
    entity.setEvaluationNo(request.evaluationNo());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setTotalAmount(totalAmount);
    entity.setStatus(request.status());
    entity.setRemark(request.remark());
    evaluationMapper.updateById(entity);

    // Soft-delete old items then re-insert
    itemMapper.delete(new LambdaQueryWrapper<SeedlingEvaluationItemEntity>()
        .eq(SeedlingEvaluationItemEntity::getEvaluationId, id));
    saveItems(id, request.items());
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    itemMapper.delete(new LambdaQueryWrapper<SeedlingEvaluationItemEntity>()
        .eq(SeedlingEvaluationItemEntity::getEvaluationId, id));
    evaluationMapper.deleteById(id);
  }

  private void saveItems(Long evaluationId, List<SeedlingEvaluationItemRequest> items) {
    for (SeedlingEvaluationItemRequest item : items) {
      SeedlingEvaluationItemEntity entity = new SeedlingEvaluationItemEntity();
      entity.setEvaluationId(evaluationId);
      entity.setLineNo(item.lineNo());
      entity.setSeedlingName(item.seedlingName());
      entity.setSpecification(item.specification());
      entity.setUnit(item.unit() == null || item.unit().isBlank() ? "株" : item.unit());
      entity.setQuantity(item.quantity());
      entity.setUnitPrice(item.unitPrice());
      entity.setAmount(item.amount());
      entity.setRemark(item.remark());
      itemMapper.insert(entity);
    }
  }

  private List<SeedlingEvaluationItemResponse> listItems(Long evaluationId) {
    List<SeedlingEvaluationItemEntity> items = itemMapper.selectList(
        new LambdaQueryWrapper<SeedlingEvaluationItemEntity>()
            .eq(SeedlingEvaluationItemEntity::getEvaluationId, evaluationId)
            .orderByAsc(SeedlingEvaluationItemEntity::getLineNo)
    );
    return items.stream().map(e -> new SeedlingEvaluationItemResponse(
        e.getId(), e.getEvaluationId(), e.getLineNo(), e.getSeedlingName(),
        e.getSpecification(), e.getUnit(), e.getQuantity(), e.getUnitPrice(),
        e.getAmount(), e.getRemark()
    )).toList();
  }

  private SeedlingEvaluationResponse toResponse(SeedlingEvaluationEntity entity) {
    return new SeedlingEvaluationResponse(
        entity.getId(),
        entity.getProjectId(),
        entity.getPartyId(),
        entity.getEvaluationNo(),
        entity.getBenchmarkDate() == null ? null : entity.getBenchmarkDate().toString(),
        entity.getSurveyDate() == null ? null : entity.getSurveyDate().toString(),
        entity.getTotalAmount(),
        entity.getStatus(),
        entity.getRemark(),
        listItems(entity.getId())
    );
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
