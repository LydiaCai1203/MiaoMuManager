package com.evaluation.appendage.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("appendage_evaluation")
public class AppendageEvaluationEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long partyId;
    private String evaluationNo;
    private String tenantName;
    private String locationText;
    private LocalDate benchmarkDate;
    private LocalDate surveyDate;
    private BigDecimal structureAmount;
    private BigDecimal equipmentMoveAmount;
    private BigDecimal seedlingMoveAmount;
    private BigDecimal totalAmount;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
