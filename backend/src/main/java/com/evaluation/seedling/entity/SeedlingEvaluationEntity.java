package com.evaluation.seedling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("seedling_evaluation")
public class SeedlingEvaluationEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long partyId;
    private String evaluationNo;
    private LocalDate benchmarkDate;
    private LocalDate surveyDate;
    private BigDecimal totalAmount;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
