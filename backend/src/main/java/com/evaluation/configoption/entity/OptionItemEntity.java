package com.evaluation.configoption.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("option_item")
public class OptionItemEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String groupCode;
    private String optionValue;
    private String optionLabel;
    private Integer sortOrder;
    private Integer enabled;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
