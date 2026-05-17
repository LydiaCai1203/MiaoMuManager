package com.evaluation.price.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("price_library")
public class PriceLibrary {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String assetCategory;
    private String assetName;
    private String specification;
    private String unit;
    private BigDecimal basePrice;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
