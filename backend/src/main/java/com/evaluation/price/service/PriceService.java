package com.evaluation.price.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.price.entity.PriceLibrary;
import com.evaluation.price.mapper.PriceLibraryMapper;
import com.evaluation.price.model.PriceRequest;
import com.evaluation.price.model.PriceResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceService {

  private final PriceLibraryMapper priceMapper;

  public PriceService(PriceLibraryMapper priceMapper) {
    this.priceMapper = priceMapper;
  }

  public List<PriceResponse> list() {
    List<PriceLibrary> entities = priceMapper.selectList(
        new LambdaQueryWrapper<PriceLibrary>().orderByDesc(PriceLibrary::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  public List<PriceResponse> lookup(String category, String name) {
    LambdaQueryWrapper<PriceLibrary> wrapper = new LambdaQueryWrapper<PriceLibrary>()
        .eq(PriceLibrary::getAssetCategory, category)
        .and(w -> w.isNull(PriceLibrary::getEffectiveDate).or().le(PriceLibrary::getEffectiveDate, LocalDate.now()))
        .and(w -> w.isNull(PriceLibrary::getExpiryDate).or().ge(PriceLibrary::getExpiryDate, LocalDate.now()));
    if (name != null && !name.isBlank()) {
      wrapper.like(PriceLibrary::getAssetName, name.trim());
    }
    wrapper.orderByAsc(PriceLibrary::getAssetName).orderByAsc(PriceLibrary::getSpecification);
    return priceMapper.selectList(wrapper).stream().map(this::toResponse).toList();
  }

  @Transactional
  public PriceResponse create(PriceRequest request) {
    PriceLibrary entity = toEntity(request);
    priceMapper.insert(entity);
    return toResponse(priceMapper.selectById(entity.getId()));
  }

  @Transactional
  public PriceResponse update(Long id, PriceRequest request) {
    ensureExists(id);
    PriceLibrary entity = toEntity(request);
    entity.setId(id);
    priceMapper.updateById(entity);
    return toResponse(priceMapper.selectById(id));
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    priceMapper.deleteById(id);
  }

  private void ensureExists(Long id) {
    if (priceMapper.selectById(id) == null) {
      throw new IllegalArgumentException("价格项不存在: " + id);
    }
  }

  private PriceLibrary toEntity(PriceRequest request) {
    PriceLibrary entity = new PriceLibrary();
    entity.setAssetCategory(request.assetCategory());
    entity.setAssetName(request.assetName());
    entity.setSpecification(request.specification());
    entity.setUnit(request.unit());
    entity.setBasePrice(request.basePrice());
    entity.setEffectiveDate(parseDate(request.effectiveDate()));
    entity.setExpiryDate(parseDate(request.expiryDate()));
    entity.setRemark(request.remark());
    return entity;
  }

  private PriceResponse toResponse(PriceLibrary entity) {
    return new PriceResponse(
        entity.getId(),
        entity.getAssetCategory(),
        entity.getAssetName(),
        entity.getSpecification(),
        entity.getUnit(),
        entity.getBasePrice(),
        entity.getEffectiveDate() == null ? null : entity.getEffectiveDate().toString(),
        entity.getExpiryDate() == null ? null : entity.getExpiryDate().toString(),
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
