package com.evaluation;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@MapperScan("com.evaluation.**.mapper")
public class AssetEvaluationApplication {

  public static void main(String[] args) {
    SpringApplication.run(AssetEvaluationApplication.class, args);
  }
}
