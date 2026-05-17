package com.evaluation.house.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.house.entity.HouseEvaluationEntity;
import com.evaluation.house.mapper.HouseEvaluationMapper;
import com.evaluation.house.model.HouseEvaluationRequest;
import com.evaluation.house.model.HouseEvaluationResponse;
import com.evaluation.price.entity.PriceLibrary;
import com.evaluation.price.mapper.PriceLibraryMapper;
import com.evaluation.project.mapper.EvaluationPartyMapper;
import com.evaluation.project.mapper.EvaluationProjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HouseService {

  private final HouseEvaluationMapper houseMapper;
  private final PriceLibraryMapper priceMapper;
  private final EvaluationProjectMapper projectMapper;
  private final EvaluationPartyMapper partyMapper;

  public HouseService(HouseEvaluationMapper houseMapper, PriceLibraryMapper priceMapper,
                      EvaluationProjectMapper projectMapper, EvaluationPartyMapper partyMapper) {
    this.houseMapper = houseMapper;
    this.priceMapper = priceMapper;
    this.projectMapper = projectMapper;
    this.partyMapper = partyMapper;
  }

  public List<HouseEvaluationResponse> list() {
    List<HouseEvaluationEntity> entities = houseMapper.selectList(
        new LambdaQueryWrapper<HouseEvaluationEntity>().orderByDesc(HouseEvaluationEntity::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  public HouseEvaluationResponse detail(Long id) {
    HouseEvaluationEntity entity = houseMapper.selectById(id);
    if (entity == null) {
      throw new IllegalArgumentException("房屋评估单不存在: " + id);
    }
    return toResponse(entity);
  }

  @Transactional
  public HouseEvaluationResponse create(HouseEvaluationRequest request) {
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());
    BigDecimal totalAmount = calculateTotal(request);
    BigDecimal suggestedPrice = lookupSuggestedPrice(request.usageType());
    int priceAdjusted = (suggestedPrice != null && request.unitPrice().compareTo(suggestedPrice) != 0) ? 1 : 0;

    HouseEvaluationEntity entity = toEntity(request);
    entity.setTotalAmount(totalAmount);
    entity.setSuggestedUnitPrice(suggestedPrice);
    entity.setPriceAdjusted(priceAdjusted);
    houseMapper.insert(entity);
    return detail(entity.getId());
  }

  @Transactional
  public HouseEvaluationResponse update(Long id, HouseEvaluationRequest request) {
    detail(id);
    ensureProjectExists(request.projectId());
    ensurePartyExists(request.projectId(), request.partyId());
    BigDecimal totalAmount = calculateTotal(request);
    BigDecimal suggestedPrice = lookupSuggestedPrice(request.usageType());
    int priceAdjusted = (suggestedPrice != null && request.unitPrice().compareTo(suggestedPrice) != 0) ? 1 : 0;

    HouseEvaluationEntity entity = toEntity(request);
    entity.setId(id);
    entity.setTotalAmount(totalAmount);
    entity.setSuggestedUnitPrice(suggestedPrice);
    entity.setPriceAdjusted(priceAdjusted);
    houseMapper.updateById(entity);
    return detail(id);
  }

  @Transactional
  public void delete(Long id) {
    detail(id);
    houseMapper.deleteById(id);
  }

  private BigDecimal lookupSuggestedPrice(String usageType) {
    if (usageType == null || usageType.isBlank()) {
      return null;
    }
    List<PriceLibrary> prices = priceMapper.selectList(
        new LambdaQueryWrapper<PriceLibrary>()
            .eq(PriceLibrary::getAssetCategory, "HOUSE")
            .eq(PriceLibrary::getAssetName, usageType)
            .and(w -> w.isNull(PriceLibrary::getEffectiveDate).or().le(PriceLibrary::getEffectiveDate, LocalDate.now()))
            .and(w -> w.isNull(PriceLibrary::getExpiryDate).or().ge(PriceLibrary::getExpiryDate, LocalDate.now()))
            .orderByDesc(PriceLibrary::getId)
            .last("LIMIT 1")
    );
    return prices.isEmpty() ? null : prices.get(0).getBasePrice();
  }

  private BigDecimal calculateTotal(HouseEvaluationRequest request) {
    return request.buildingArea()
        .multiply(request.unitPrice())
        .multiply(request.regionFactor())
        .multiply(request.floorFactor())
        .multiply(request.orientationFactor())
        .multiply(request.decorationFactor());
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

  private HouseEvaluationEntity toEntity(HouseEvaluationRequest request) {
    HouseEvaluationEntity entity = new HouseEvaluationEntity();
    entity.setProjectId(request.projectId());
    entity.setPartyId(request.partyId());
    entity.setEvaluationNo(request.evaluationNo());
    entity.setLocationText(request.locationText());
    entity.setUsageType(request.usageType());
    entity.setBuildingArea(request.buildingArea());
    entity.setUnitPrice(request.unitPrice());
    entity.setRegionFactor(request.regionFactor());
    entity.setFloorFactor(request.floorFactor());
    entity.setOrientationFactor(request.orientationFactor());
    entity.setDecorationFactor(request.decorationFactor());
    entity.setBenchmarkDate(parseDate(request.benchmarkDate()));
    entity.setSurveyDate(parseDate(request.surveyDate()));
    entity.setStatus(request.status());
    entity.setRemark(request.remark());
    return entity;
  }

  private HouseEvaluationResponse toResponse(HouseEvaluationEntity entity) {
    return new HouseEvaluationResponse(
        entity.getId(),
        entity.getProjectId(),
        entity.getPartyId(),
        entity.getEvaluationNo(),
        entity.getLocationText(),
        entity.getUsageType(),
        entity.getBuildingArea(),
        entity.getUnitPrice(),
        entity.getRegionFactor(),
        entity.getFloorFactor(),
        entity.getOrientationFactor(),
        entity.getDecorationFactor(),
        entity.getTotalAmount(),
        entity.getSuggestedUnitPrice(),
        entity.getPriceAdjusted(),
        entity.getBenchmarkDate() == null ? null : entity.getBenchmarkDate().toString(),
        entity.getSurveyDate() == null ? null : entity.getSurveyDate().toString(),
        entity.getStatus(),
        entity.getRemark()
    );
  }

  private LocalDate parseDate(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return LocalDate.parse(value);
  }
}
