package com.evaluation.house.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("house_evaluation")
public class HouseEvaluationEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long partyId;
    private String evaluationNo;
    private String locationText;
    private String usageType;
    private BigDecimal buildingArea;
    private BigDecimal unitPrice;
    private BigDecimal regionFactor;
    private BigDecimal floorFactor;
    private BigDecimal orientationFactor;
    private BigDecimal decorationFactor;
    private BigDecimal totalAmount;
    private BigDecimal suggestedUnitPrice;
    private Integer priceAdjusted;
    private LocalDate benchmarkDate;
    private LocalDate surveyDate;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
