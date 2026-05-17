package com.evaluation.appendage.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("appendage_evaluation_item")
public class AppendageEvaluationItemEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long evaluationId;
    private String assetType;
    private String assetCode;
    private Integer lineNo;
    private String itemName;
    private String specification;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal replacementUnitPrice;
    private BigDecimal replacementAmount;
    private BigDecimal noveltyRate;
    private BigDecimal evaluationUnitPrice;
    private BigDecimal evaluationAmount;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
