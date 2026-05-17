package com.evaluation.project.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("evaluation_party")
public class EvaluationParty {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String partyType;
    private String partyName;
    private String idNo;
    private String contactPhone;
    private String villageGroup;
    private String tenantName;
    private String locationText;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
