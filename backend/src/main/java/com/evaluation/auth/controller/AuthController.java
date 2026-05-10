package com.evaluation.auth.controller;

import com.evaluation.auth.model.AuthUser;
import com.evaluation.auth.model.LoginRequest;
import com.evaluation.auth.model.UserRequest;
import com.evaluation.auth.model.UserResponse;
import com.evaluation.auth.service.UserService;
import com.evaluation.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserService userService;

  public AuthController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/login")
  public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest body) {
    return ApiResponse.success(Map.of(
        "token", "dev-token-" + body.username(),
        "user", new AuthUser(body.username(), "管理员", "ADMIN")
    ));
  }

  @GetMapping("/me")
  public ApiResponse<AuthUser> me(Authentication authentication) {
    String username = authentication == null ? "admin" : String.valueOf(authentication.getPrincipal()).replace("dev-token-", "");
    return ApiResponse.success(new AuthUser(username, "管理员", "ADMIN"));
  }

  @GetMapping("/users")
  public ApiResponse<List<UserResponse>> users() {
    return ApiResponse.success(userService.list());
  }

  @PostMapping("/users")
  public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
    return ApiResponse.success(userService.create(request));
  }

  @PutMapping("/users/{id}")
  public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
    return ApiResponse.success(userService.update(id, request));
  }

  @DeleteMapping("/users/{id}")
  public ApiResponse<Boolean> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    return ApiResponse.success(true);
  }
}
