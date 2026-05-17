package com.evaluation.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evaluation.auth.entity.SysUser;
import com.evaluation.auth.mapper.SysUserMapper;
import com.evaluation.auth.model.UserRequest;
import com.evaluation.auth.model.UserResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final SysUserMapper userMapper;

  public UserService(SysUserMapper userMapper) {
    this.userMapper = userMapper;
  }

  public List<UserResponse> list() {
    List<SysUser> entities = userMapper.selectList(
        new LambdaQueryWrapper<SysUser>().orderByDesc(SysUser::getId)
    );
    return entities.stream().map(this::toResponse).toList();
  }

  @Transactional
  public UserResponse create(UserRequest request) {
    SysUser entity = new SysUser();
    entity.setUsername(request.username());
    entity.setPasswordHash("dev-password");
    entity.setRealName(request.realName());
    entity.setPhone(request.phone());
    entity.setStatus(request.status());
    userMapper.insert(entity);
    return toResponse(userMapper.selectById(entity.getId()));
  }

  @Transactional
  public UserResponse update(Long id, UserRequest request) {
    ensureExists(id);
    SysUser entity = new SysUser();
    entity.setId(id);
    entity.setUsername(request.username());
    entity.setRealName(request.realName());
    entity.setPhone(request.phone());
    entity.setStatus(request.status());
    userMapper.updateById(entity);
    return toResponse(userMapper.selectById(id));
  }

  @Transactional
  public void delete(Long id) {
    ensureExists(id);
    userMapper.deleteById(id);
  }

  private void ensureExists(Long id) {
    if (userMapper.selectById(id) == null) {
      throw new IllegalArgumentException("用户不存在: " + id);
    }
  }

  private UserResponse toResponse(SysUser entity) {
    return new UserResponse(
        entity.getId(),
        entity.getUsername(),
        entity.getRealName(),
        entity.getPhone(),
        entity.getStatus()
    );
  }
}
