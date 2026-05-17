package com.evaluation.seedling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("seedling_evaluation_item")
public class SeedlingEvaluationItemEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long evaluationId;
    private Integer lineNo;
    private String seedlingName;
    private String specification;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
