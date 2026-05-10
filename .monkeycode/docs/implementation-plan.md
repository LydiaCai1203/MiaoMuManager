# 资产评估系统工程落地方案

## 1. 第一阶段目标

第一阶段直接建设可运行的前后端分离系统，覆盖以下能力：

1. 用户登录与基础权限控制
2. 评估项目管理
3. 被评估对象管理
4. 苗木评估录入、编辑、查询
5. 附属物评估录入、编辑、查询
6. Excel 模板下载与导入
7. 价格库基础管理

## 2. 仓库结构建议

```text
.
├── backend/
├── frontend/
├── sql/
├── templates/
├── README.md
└── .monkeycode/
```

说明：

- `backend/` 放 Spring Boot 工程
- `frontend/` 放 Vue 3 工程
- `sql/` 放建表和初始化脚本
- `templates/` 放 Excel 模板、Word 报告模板

## 3. 后端工程结构

```text
backend/
  src/main/java/com/evaluation/
    AssetEvaluationApplication.java
    common/
      api/
      config/
      exception/
      model/
      util/
    security/
      config/
      filter/
      handler/
      jwt/
    auth/
      controller/
      service/
      mapper/
      model/
    project/
      controller/
      service/
      mapper/
      model/
    seedling/
      controller/
      service/
      mapper/
      model/
    appendage/
      controller/
      service/
      mapper/
      model/
    price/
      controller/
      service/
      mapper/
      model/
    importtask/
      controller/
      service/
      parser/
      model/
    file/
      controller/
      service/
      model/
```

### 3.1 每个业务模块内部结构

建议每个业务模块统一包含：

- `controller`：接口层
- `service`：应用服务与业务逻辑
- `mapper`：MyBatis-Plus Mapper
- `model/entity`：数据库实体
- `model/dto`：请求对象
- `model/vo`：响应对象

### 3.2 后端关键约定

#### 统一响应

定义 `ApiResponse<T>`：

- `code`
- `message`
- `data`

#### 分页模型

定义 `PageQuery` 和 `PageResult<T>`。

#### 统一异常

定义：

- 业务异常 `BizException`
- 参数校验异常处理
- 全局异常处理器 `GlobalExceptionHandler`

#### 鉴权

- 登录接口返回 JWT
- 前端在请求头传 `Authorization: Bearer <token>`
- 后端通过 JWT Filter 完成认证

## 4. 前端工程结构

```text
frontend/
  src/
    main.ts
    App.vue
    api/
      auth.ts
      project.ts
      seedling.ts
      appendage.ts
      price.ts
      import.ts
    router/
      index.ts
    stores/
      auth.ts
      app.ts
    layouts/
      BasicLayout.vue
    views/
      login/
      dashboard/
      project/
      seedling/
      appendage/
      price/
      import/
      system/
    components/
      business/
      common/
    utils/
      request.ts
      auth.ts
      dict.ts
      format.ts
    styles/
```

### 4.1 前端路由建议

```text
/login
/dashboard
/projects
/projects/:id
/seedling
/seedling/create
/seedling/:id
/appendage
/appendage/create
/appendage/:id
/prices
/import
/system/users
```

### 4.2 页面组件拆分建议

#### 苗木评估页

- `SeedlingFormBaseCard`
- `SeedlingItemTable`
- `SeedlingSummaryBar`

#### 附属物评估页

- `AppendageBaseCard`
- `StructureItemTable`
- `EquipmentMoveItemTable`
- `SeedlingMoveItemTable`
- `AppendageSummaryBar`

#### 导入中心

- `ImportUploadCard`
- `ImportTaskTable`
- `ImportErrorPreview`

## 5. 前后端接口约定补充

### 5.1 列表查询接口

所有列表查询建议统一支持：

- `pageNo`
- `pageSize`
- `keyword`
- `projectId`
- `status`
- `dateFrom`
- `dateTo`

### 5.2 保存接口模式

编辑页采用“主表一次提交 + 明细数组整体保存”模式。

以苗木评估为例：

```json
{
  "projectId": 1,
  "partyId": 2,
  "benchmarkDate": "2026-05-10",
  "surveyDate": "2026-05-10",
  "remark": "",
  "items": [
    {
      "lineNo": 1,
      "seedlingName": "桂花",
      "specification": "胸径 8cm",
      "unit": "株",
      "quantity": 10,
      "unitPrice": 120,
      "amount": 1200,
      "remark": ""
    }
  ]
}
```

附属物评估采用同样模式，只是 `items` 中多一个 `assetType` 字段。

### 5.3 草稿与提交状态

业务状态建议统一：

- `DRAFT`
- `SUBMITTED`
- `CONFIRMED`

第一阶段先支持：

- 保存草稿
- 提交评估单

## 6. Excel 导入实现约定

### 6.1 导入方式

建议采用“两段式导入”：

1. 上传并解析
2. 用户确认后入库

### 6.2 导入解析流程

1. 前端上传 Excel 文件
2. 后端创建 `file_record`
3. 后端创建 `import_task`
4. 解析器按模板类型读取工作表
5. 校验必填项、数值格式、项目归属
6. 形成结构化预览结果并写入 `result_snapshot`
7. 前端展示解析结果
8. 用户确认后调用正式入库接口

### 6.3 导入校验规则建议

#### 苗木模板

- `被评估单位` 必填
- 至少一条苗木明细有效
- `苗木名称` 必填
- `数量` 必须为数字
- `补偿单价` 必须为数字

#### 附属物模板

- `被评估单位` 或对象信息必填
- 明细区至少一条有效记录
- `名称` 必填
- `数量`、`评估值`、`成新率` 等字段需要数值校验

## 7. 编号规则建议

建议所有业务单据生成可读编号。

### 7.1 项目编号

格式：

`PRJ20260510001`

### 7.2 评估单编号

- 苗木评估：`SE20260510001`
- 附属物评估：`AP20260510001`
- 房屋评估：`HO20260510001`

### 7.3 导入任务编号

`IM20260510001`

## 8. 初始化数据建议

### 8.1 默认管理员

- 用户名：`admin`
- 初始密码：后端启动时从配置文件读取并加密写入，或通过初始化脚本生成加密密码

### 8.2 默认角色

- `ADMIN`
- `APPRAISER`
- `AUDITOR`

### 8.3 默认字典项

- 项目状态
- 评估单状态
- 资产分类
- 被评估对象类型

## 9. 第一阶段开发顺序

### 9.1 后端顺序

1. 搭建 Spring Boot 基础工程
2. 接入 MyBatis-Plus、JWT、安全配置
3. 完成用户登录接口
4. 完成项目管理和对象管理
5. 完成苗木评估 CRUD
6. 完成附属物评估 CRUD
7. 完成价格库 CRUD
8. 完成 Excel 上传与解析

### 9.2 前端顺序

1. 搭建 Vue 3 基础工程
2. 完成登录页和路由守卫
3. 完成基础布局
4. 完成项目管理页面
5. 完成苗木评估页面
6. 完成附属物评估页面
7. 完成价格库页面
8. 完成导入中心页面

## 10. 开发时的关键实现建议

### 10.1 苗木与附属物表单

前端编辑页使用可编辑表格实现，明细金额实时自动计算。

### 10.2 明细保存策略

第一阶段采用“整体替换明细”的保存方式最简单稳定：

1. 保存主表
2. 删除逻辑上旧明细
3. 批量插入新明细

这里使用逻辑删除字段配合批量写入，方便后续审计和回滚。

### 10.3 Excel 模板适配

解析时按“表头定位 + 数据区读取”方式实现，减少对固定行号的依赖。

这对后续模板轻微调整更稳。

## 11. 下一步实现入口

下一步可以直接开始创建两个工程：

1. `backend/` Spring Boot 工程骨架
2. `frontend/` Vue 3 + Vite 工程骨架

当前文档和 `schema.sql` 已经足够支撑这一阶段开工。
