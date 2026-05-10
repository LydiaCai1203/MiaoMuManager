# 资产评估系统前后端分离设计

## 1. 项目目标

建设一个前后端分离的资产评估系统，覆盖以下业务场景：

- 苗木评估
- 附属物评估
- 房屋评估
- Excel 模板导入
- 评估结果汇总
- Word 报告生成
- 价格库与历史价格管理
- 用户认证与角色权限控制

系统以 `README.md` 为业务范围基线，以现有 Excel 模板为字段设计依据，优先保证导入、录入、计算、查询、汇总四条主链路完整可落地。

## 2. 总体架构

### 2.1 架构形式

采用前后端分离架构。

- 前端：`Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router`
- 后端：`Spring Boot 3 + Spring Security + JWT + MyBatis-Plus`
- 数据库：`MySQL 8`
- 缓存：`Redis`
- 文件处理：`Apache POI` 用于 Excel 导入导出，`docx4j` 或 `poi-tl` 用于 Word 报告生成
- 对象存储：预留本地文件存储和 MinIO 兼容接口

### 2.2 部署结构

- 前端单独部署，负责页面渲染和文件上传
- 后端提供 REST API
- 前端开发环境通过 `/api` 反向代理访问后端
- 鉴权采用 JWT Access Token

### 2.3 模块划分

后端按业务域拆分模块：

- `auth`：登录、用户、角色、权限
- `project`：评估项目、评估对象、基础信息
- `seedling`：苗木评估
- `appendage`：附属物评估
- `house`：房屋评估
- `price`：价格库、历史价格
- `import`：Excel 导入
- `report`：报告生成
- `common`：文件、字典、统一响应、异常处理

前端按页面域拆分模块：

- 登录页
- 首页仪表盘
- 项目管理
- 苗木评估
- 附属物评估
- 房屋评估
- 价格管理
- 导入中心
- 报告中心
- 系统管理

## 3. 业务建模

### 3.1 核心业务对象

系统建议围绕“评估项目”组织所有数据。

一个评估项目下可以有多个评估对象，评估对象可以是个人、村组、单位、租户或房屋产权主体。每个评估对象下挂接不同类型的资产评估记录。

核心层级：

1. 评估项目
2. 被评估对象
3. 资产评估记录
4. 明细项
5. 汇总与报告

### 3.2 评估项目

评估项目用于统一承载同一征收或建设场景下的全部评估数据。

建议字段：

- 项目名称
- 项目编号
- 项目类型
- 委托方
- 所属区域
- 评估基准日
- 现场勘察日
- 项目状态
- 备注

### 3.3 被评估对象

用于承载 Excel 中的 `姓名`、`被评估单位`、`租户`、`位置` 等信息。

建议字段：

- 所属项目 ID
- 对象类型：个人、单位、村组、租户、其他
- 对象名称
- 联系方式
- 身份证号或统一社会信用代码
- 所在位置
- 所属村组
- 租户名称
- 备注

## 4. Excel 驱动的领域设计

### 4.1 苗木评估

根据 `苗木模板.xlsx`，苗木评估至少包含两类数据结构。

第一类是汇总信息：

- 姓名
- 金额
- 备注

第二类是苗木明细：

- 苗木名称
- 规格
- 单位
- 数量
- 补偿单价
- 补偿金额
- 备注

因此系统建议设计为：

- `seedling_evaluation`：一张评估单
- `seedling_evaluation_item`：多条苗木明细

`seedling_evaluation` 建议字段：

- 项目 ID
- 被评估对象 ID
- 评估单编号
- 项目名称快照
- 被评估单位快照
- 评估基准日
- 现场勘察日
- 总金额
- 状态
- 备注

`seedling_evaluation_item` 建议字段：

- 评估单 ID
- 序号
- 苗木名称
- 规格
- 单位
- 数量
- 补偿单价
- 补偿金额
- 备注

### 4.2 附属物评估

根据 `附属物评估模板.xlsx`，附属物评估是一个复合表单，至少包含三类资产：

- 构筑物补偿
- 设施设备及物品搬迁补偿
- 苗木移植补偿

这里建议不要为每个 Excel 页单独建很多主表，而是使用“主表 + 分类明细表”设计。

- `appendage_evaluation`：附属物评估单主表
- `appendage_evaluation_item`：按分类存储明细

`appendage_evaluation` 建议字段：

- 项目 ID
- 被评估对象 ID
- 评估单编号
- 项目名称快照
- 被评估单位快照
- 租户名称
- 位置
- 评估基准日
- 现场勘察日
- 构筑物小计
- 设备搬迁小计
- 苗木移植小计
- 合计金额
- 状态
- 备注

`appendage_evaluation_item` 建议字段：

- 评估单 ID
- 资产分类：`STRUCTURE`、`EQUIPMENT_MOVE`、`SEEDLING_MOVE`
- 代码
- 序号
- 名称
- 规格型号或结构
- 单位
- 数量
- 重置单价
- 重置价值
- 成新率
- 评估单价
- 评估值
- 备注

说明：

- 构筑物类使用全部字段
- 设备搬迁类通常只需要名称、规格、单位、数量、评估单价、评估值
- 苗木移植类通常只需要名称、规格、单位、数量、评估单价、评估值
- 统一明细表可以减少代码重复，并方便后续扩展其他补偿类型

### 4.3 房屋评估

README 中有房屋评估公式，但当前仓库没有房屋 Excel 模板。因此第一版设计可以按业务规则先行定义结构，后续收到实际模板再微调。

建议主表：`house_evaluation`

建议字段：

- 项目 ID
- 被评估对象 ID
- 评估单编号
- 房屋坐落
- 房屋用途
- 建筑面积
- 单价
- 区域系数
- 楼层系数
- 朝向系数
- 装修系数
- 评估总值
- 评估基准日
- 现场勘察日
- 备注

如果后续房屋也存在多明细项，再补充 `house_evaluation_item`。

## 5. 数据库设计

### 5.1 通用字段约定

所有业务表建议统一包含：

- `id` bigint
- `created_at` datetime
- `created_by` bigint
- `updated_at` datetime
- `updated_by` bigint
- `deleted` tinyint

金额字段统一使用 `decimal(18,2)`。
数量、比例类字段统一使用 `decimal(18,4)`。

### 5.2 核心表清单

#### 5.2.1 用户与权限

- `sys_user`
- `sys_role`
- `sys_permission`
- `sys_user_role`
- `sys_role_permission`

#### 5.2.2 项目与对象

- `evaluation_project`
- `evaluation_party`

#### 5.2.3 苗木评估

- `seedling_evaluation`
- `seedling_evaluation_item`

#### 5.2.4 附属物评估

- `appendage_evaluation`
- `appendage_evaluation_item`

#### 5.2.5 房屋评估

- `house_evaluation`

#### 5.2.6 价格管理

- `price_library`
- `price_history`

#### 5.2.7 导入与报告

- `import_task`
- `report_task`
- `file_record`

### 5.3 关键表字段建议

#### `evaluation_project`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| project_code | varchar(64) | 项目编号 |
| project_name | varchar(255) | 项目名称 |
| project_type | varchar(32) | 项目类型 |
| entrusting_party | varchar(255) | 委托方 |
| region_name | varchar(128) | 所属区域 |
| benchmark_date | date | 评估基准日 |
| survey_date | date | 现场勘察日 |
| status | varchar(32) | 状态 |
| remark | varchar(500) | 备注 |

#### `evaluation_party`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| project_id | bigint | 所属项目 |
| party_type | varchar(32) | 个人/单位/租户/村组 |
| party_name | varchar(255) | 名称 |
| id_no | varchar(64) | 证件号 |
| contact_phone | varchar(32) | 联系方式 |
| village_group | varchar(128) | 所属村组 |
| tenant_name | varchar(255) | 租户名称 |
| location_text | varchar(255) | 位置 |
| remark | varchar(500) | 备注 |

#### `seedling_evaluation`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| project_id | bigint | 项目 ID |
| party_id | bigint | 被评估对象 ID |
| evaluation_no | varchar(64) | 评估单编号 |
| benchmark_date | date | 评估基准日 |
| survey_date | date | 现场勘察日 |
| total_amount | decimal(18,2) | 总金额 |
| status | varchar(32) | 草稿/已提交/已确认 |
| remark | varchar(500) | 备注 |

#### `seedling_evaluation_item`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| evaluation_id | bigint | 评估单 ID |
| line_no | int | 序号 |
| seedling_name | varchar(128) | 苗木名称 |
| specification | varchar(128) | 规格 |
| unit | varchar(32) | 单位 |
| quantity | decimal(18,4) | 数量 |
| unit_price | decimal(18,2) | 补偿单价 |
| amount | decimal(18,2) | 补偿金额 |
| remark | varchar(500) | 备注 |

#### `appendage_evaluation`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| project_id | bigint | 项目 ID |
| party_id | bigint | 被评估对象 ID |
| evaluation_no | varchar(64) | 评估单编号 |
| tenant_name | varchar(255) | 租户名称 |
| location_text | varchar(255) | 位置 |
| benchmark_date | date | 评估基准日 |
| survey_date | date | 现场勘察日 |
| structure_amount | decimal(18,2) | 构筑物小计 |
| equipment_move_amount | decimal(18,2) | 设备搬迁小计 |
| seedling_move_amount | decimal(18,2) | 苗木移植小计 |
| total_amount | decimal(18,2) | 合计 |
| status | varchar(32) | 状态 |
| remark | varchar(500) | 备注 |

#### `appendage_evaluation_item`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| evaluation_id | bigint | 评估单 ID |
| asset_type | varchar(32) | 资产分类 |
| asset_code | varchar(64) | 代码 |
| line_no | int | 序号 |
| item_name | varchar(128) | 名称 |
| specification | varchar(255) | 规格型号/结构 |
| unit | varchar(32) | 单位 |
| quantity | decimal(18,4) | 数量 |
| replacement_unit_price | decimal(18,2) | 重置单价 |
| replacement_amount | decimal(18,2) | 重置价值 |
| novelty_rate | decimal(18,4) | 成新率 |
| evaluation_unit_price | decimal(18,2) | 评估单价 |
| evaluation_amount | decimal(18,2) | 评估值 |
| remark | varchar(500) | 备注 |

#### `house_evaluation`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| project_id | bigint | 项目 ID |
| party_id | bigint | 被评估对象 ID |
| evaluation_no | varchar(64) | 评估单编号 |
| location_text | varchar(255) | 房屋坐落 |
| usage_type | varchar(64) | 房屋用途 |
| building_area | decimal(18,4) | 建筑面积 |
| unit_price | decimal(18,2) | 单价 |
| region_factor | decimal(18,4) | 区域系数 |
| floor_factor | decimal(18,4) | 楼层系数 |
| orientation_factor | decimal(18,4) | 朝向系数 |
| decoration_factor | decimal(18,4) | 装修系数 |
| total_amount | decimal(18,2) | 评估总值 |
| benchmark_date | date | 评估基准日 |
| survey_date | date | 现场勘察日 |
| remark | varchar(500) | 备注 |

#### `price_library`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| asset_category | varchar(32) | 资产类别 |
| asset_name | varchar(128) | 资产名称 |
| specification | varchar(255) | 规格 |
| unit | varchar(32) | 单位 |
| base_price | decimal(18,2) | 基准价格 |
| effective_date | date | 生效日期 |
| expiry_date | date | 失效日期 |
| remark | varchar(500) | 备注 |

#### `price_history`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| price_library_id | bigint | 价格项 ID |
| change_type | varchar(32) | 新增/调整/停用 |
| old_price | decimal(18,2) | 旧价 |
| new_price | decimal(18,2) | 新价 |
| changed_at | datetime | 调整时间 |
| changed_by | bigint | 调整人 |
| remark | varchar(500) | 备注 |

## 6. 计算规则设计

### 6.1 苗木评估

第一版支持两种模式：

1. 手工录入单价和金额
2. 根据价格库自动带出单价，再按数量计算金额

金额规则：

`金额 = 数量 * 单价`

如果后续启用 README 中的状况系数和树龄系数，可扩展为：

`金额 = 数量 * 基准单价 * 状况系数 * 树龄系数`

建议把系数设计成可配置字段，避免把业务规则写死在代码里。

### 6.2 附属物评估

构筑物类建议按模板字段计算：

`重置价值 = 数量 * 重置单价`

`评估单价 = 重置单价 * 成新率`

`评估值 = 数量 * 评估单价`

设备搬迁类和苗木移植类可以先按：

`评估值 = 数量 * 评估单价`

### 6.3 房屋评估

按 README 公式：

`评估总值 = 面积 * 单价 * 区域系数 * 楼层系数 * 朝向系数 * 装修系数`

## 7. 后端接口设计

统一前缀：`/api`

### 7.1 认证与用户

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}`

### 7.2 项目管理

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `GET /api/projects/{id}/parties`
- `POST /api/projects/{id}/parties`

### 7.3 苗木评估

- `GET /api/seedling-evaluations`
- `POST /api/seedling-evaluations`
- `GET /api/seedling-evaluations/{id}`
- `PUT /api/seedling-evaluations/{id}`
- `POST /api/seedling-evaluations/{id}/submit`
- `GET /api/seedling-evaluations/{id}/report`

### 7.4 附属物评估

- `GET /api/appendage-evaluations`
- `POST /api/appendage-evaluations`
- `GET /api/appendage-evaluations/{id}`
- `PUT /api/appendage-evaluations/{id}`
- `POST /api/appendage-evaluations/{id}/submit`
- `GET /api/appendage-evaluations/{id}/report`

### 7.5 房屋评估

- `GET /api/house-evaluations`
- `POST /api/house-evaluations`
- `GET /api/house-evaluations/{id}`
- `PUT /api/house-evaluations/{id}`
- `POST /api/house-evaluations/{id}/submit`

### 7.6 价格管理

- `GET /api/prices`
- `POST /api/prices`
- `PUT /api/prices/{id}`
- `GET /api/prices/history`

### 7.7 Excel 导入

- `GET /api/templates/seedling`
- `GET /api/templates/appendage`
- `POST /api/import/seedling`
- `POST /api/import/appendage`
- `GET /api/import/tasks/{id}`

### 7.8 报告生成

- `POST /api/reports/seedling/{id}`
- `POST /api/reports/appendage/{id}`
- `POST /api/reports/house/{id}`
- `GET /api/reports/tasks/{id}`

## 8. 前端页面设计

### 8.1 页面结构

- `/login` 登录页
- `/dashboard` 首页
- `/projects` 项目列表
- `/projects/:id` 项目详情
- `/seedling` 苗木评估列表
- `/seedling/:id` 苗木评估编辑页
- `/appendage` 附属物评估列表
- `/appendage/:id` 附属物评估编辑页
- `/house` 房屋评估列表
- `/house/:id` 房屋评估编辑页
- `/prices` 价格库
- `/import` 导入中心
- `/reports` 报告中心
- `/system/users` 用户管理

### 8.2 核心页面说明

#### 苗木评估编辑页

页面分三部分：

1. 基础信息区：项目、被评估单位、评估基准日、现场勘察日、备注
2. 明细表格区：苗木名称、规格、单位、数量、单价、金额、备注
3. 汇总区：总金额、提交按钮、导入按钮、生成报告按钮

#### 附属物评估编辑页

页面分 Tab 或分区：

1. 基础信息
2. 构筑物补偿明细
3. 设备搬迁明细
4. 苗木移植明细
5. 汇总与报告

#### 导入中心

支持：

- 模板下载
- Excel 上传
- 字段校验结果展示
- 错误行回显
- 导入任务进度查询

## 9. 前后端协作约定

### 9.1 API 返回结构

建议统一：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

分页结构建议：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "records": [],
    "total": 0,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### 9.2 文件导入流程

1. 前端上传 Excel
2. 后端保存原始文件
3. 后端解析 Excel 并做字段校验
4. 生成导入任务结果
5. 前端展示成功行、失败行、错误原因
6. 用户确认后正式入库

### 9.3 报告生成流程

1. 用户提交评估单
2. 后端按 Word 模板合并数据
3. 生成报告文件并保存
4. 前端下载报告

## 10. 第一阶段开发建议

第一阶段建议先完成最小可用版本，范围如下：

1. 用户登录
2. 项目管理
3. 被评估对象管理
4. 苗木评估录入与列表查询
5. 附属物评估录入与列表查询
6. Excel 模板下载与导入
7. 价格库基础管理

房屋评估和 Word 报告可以放到第二阶段，这样可以先让系统具备核心业务价值。

## 11. 推荐目录结构

### 前端

```text
frontend/
  src/
    api/
    views/
    components/
    stores/
    router/
    layouts/
    utils/
```

### 后端

```text
backend/
  src/main/java/com/evaluation/
    common/
    config/
    security/
    auth/
    project/
    seedling/
    appendage/
    house/
    price/
    report/
    importtask/
```

## 12. 设计结论

这个项目适合按“项目 + 对象 + 评估单 + 明细”的统一模型建设。

这样可以同时满足：

- Excel 模板导入
- 多类资产评估
- 汇总查询
- 后续报告生成
- 前后端分离场景下的清晰接口边界

当前最关键的设计点有两个：

1. 以 `evaluation_project` 和 `evaluation_party` 做统一主线
2. 让附属物评估采用“主表 + 分类明细表”结构，避免后续扩展失控
