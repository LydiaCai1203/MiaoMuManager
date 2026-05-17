package com.evaluation.configoption.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.configoption.entity.OptionItemEntity;
import com.evaluation.configoption.mapper.OptionItemMapper;
import com.evaluation.configoption.model.OptionItemRequest;
import com.evaluation.configoption.model.OptionItemResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OptionItemService {

  private final OptionItemMapper optionMapper;

  public OptionItemService(OptionItemMapper optionMapper) {
    this.optionMapper = optionMapper;
  }

  public List<OptionItemResponse> listEnabledByGroup(String groupCode) {
    List<OptionItemEntity> entities = optionMapper.selectList(
        new LambdaQueryWrapper<OptionItemEntity>()
            .eq(OptionItemEntity::getGroupCode, groupCode)
            .eq(OptionItemEntity::getEnabled, 1)
            .orderByAsc(OptionItemEntity::getSortOrder)
            .orderByAsc(OptionItemEntity::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  public List<OptionItemResponse> listAll(String groupCode) {
    LambdaQueryWrapper<OptionItemEntity> wrapper = new LambdaQueryWrapper<>();
    if (groupCode != null && !groupCode.isBlank()) {
      wrapper.eq(OptionItemEntity::getGroupCode, groupCode);
    }
    wrapper.orderByAsc(OptionItemEntity::getGroupCode)
        .orderByAsc(OptionItemEntity::getSortOrder)
        .orderByAsc(OptionItemEntity::getId);
    return optionMapper.selectList(wrapper).stream().map(this::toResponse).toList();
  }

  @Transactional
  public OptionItemResponse create(OptionItemRequest request) {
    OptionItemEntity entity = toEntity(request);
    optionMapper.insert(entity);
    return toResponse(optionMapper.selectById(entity.getId()));
  }

  @Transactional
  public OptionItemResponse update(Long id, OptionItemRequest request) {
    ensureExists(id);
    OptionItemEntity entity = toEntity(request);
    entity.setId(id);
    optionMapper.updateById(entity);
    return toResponse(optionMapper.selectById(id));
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    optionMapper.deleteById(id);
  }

  private void ensureExists(Long id) {
    if (optionMapper.selectById(id) == null) {
      throw new IllegalArgumentException("配置项不存在: " + id);
    }
  }

  private OptionItemEntity toEntity(OptionItemRequest request) {
    OptionItemEntity entity = new OptionItemEntity();
    entity.setGroupCode(request.groupCode() == null ? null : request.groupCode().trim().toUpperCase());
    entity.setOptionValue(request.optionValue());
    entity.setOptionLabel(request.optionLabel());
    entity.setSortOrder(request.sortOrder());
    entity.setEnabled(request.enabled() ? 1 : 0);
    entity.setRemark(request.remark());
    return entity;
  }

  private OptionItemResponse toResponse(OptionItemEntity entity) {
    return new OptionItemResponse(
        entity.getId(),
        entity.getGroupCode(),
        entity.getOptionValue(),
        entity.getOptionLabel(),
        entity.getSortOrder(),
        entity.getEnabled() == 1,
        entity.getRemark()
    );
  }
}
