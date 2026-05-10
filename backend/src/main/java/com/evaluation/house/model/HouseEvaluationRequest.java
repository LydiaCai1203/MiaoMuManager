package com.evaluation.house.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record HouseEvaluationRequest(
    @NotNull(message = "项目不能为空") Long projectId,
    @NotNull(message = "被评估对象不能为空") Long partyId,
    @NotBlank(message = "评估单编号不能为空") String evaluationNo,
    String locationText,
    String usageType,
    @NotNull(message = "建筑面积不能为空") @DecimalMin(value = "0.0", inclusive = false, message = "建筑面积必须大于 0") BigDecimal buildingArea,
    @NotNull(message = "单价不能为空") @DecimalMin(value = "0.0", inclusive = false, message = "单价必须大于 0") BigDecimal unitPrice,
    @NotNull(message = "区域系数不能为空") BigDecimal regionFactor,
    @NotNull(message = "楼层系数不能为空") BigDecimal floorFactor,
    @NotNull(message = "朝向系数不能为空") BigDecimal orientationFactor,
    @NotNull(message = "装修系数不能为空") BigDecimal decorationFactor,
    String benchmarkDate,
    String surveyDate,
    @NotBlank(message = "状态不能为空") String status,
    String remark
) {
}
