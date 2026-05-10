# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[项目起始资料形态]
- Date: 2026-05-10
- Context: Agent 在执行系统设计任务时发现
- Category: 代码结构
- Instructions:
  - 当前仓库以 README 业务说明和 Excel 模板为主，尚未包含实际前后端工程代码
  - 业务设计需要优先参考 README 的模块范围，以及 Excel 模板中的真实字段结构

[系统建模主线]
- Date: 2026-05-10
- Context: Agent 在执行系统设计任务时发现
- Category: 代码模式
- Instructions:
  - 该项目适合围绕 evaluation_project、evaluation_party、evaluation record、evaluation item 的统一模型展开设计
  - 附属物评估适合采用主表加分类明细表结构，以承载构筑物、设备搬迁和苗木移植等多类资产

[第一阶段落地方式]
- Date: 2026-05-10
- Context: Agent 在执行系统设计任务时发现
- Category: 构建方法
- Instructions:
  - 第一阶段优先建设登录、项目管理、被评估对象、苗木评估、附属物评估、价格库和 Excel 导入
  - 工程结构采用 frontend 和 backend 分目录的前后端分离形式
  - Excel 导入采用上传解析、结果确认、正式入库的两段式流程

[当前项目启动方式]
- Date: 2026-05-10
- Context: Agent 在执行项目骨架搭建任务时发现
- Category: 构建方法
- Instructions:
  - 后端目录为 backend，使用 mvn spring-boot:run 启动，默认端口 8080
  - 前端目录为 frontend，使用 npm run dev 启动，默认端口 5173
  - 前端 Vite 已配置 /api 代理到 http://localhost:8080，并配置 allowedHosts 为 .monkeycode-ai.online

[当前开发态实现约定]
- Date: 2026-05-10
- Context: Agent 在执行登录与项目管理联调任务时发现
- Category: 代码模式
- Instructions:
  - 当前登录鉴权采用开发态 Bearer token 方案，后端通过 DevTokenFilter 识别 Authorization 头
  - 当前项目管理和被评估对象管理采用内存服务 ProjectService 存储，适合在接数据库前完成前后端联调

[数据存储约定]
- Date: 2026-05-10
- Context: 用户在开发过程中明确指定
- Instructions:
  - 数据需要存 PostgreSQL
  - 业务数据实现使用数据库持久化，不使用内存存储

[当前后端持久化方式]
- Date: 2026-05-10
- Context: Agent 在执行 PostgreSQL 切换和苗木评估开发任务时发现
- Category: 代码模式
- Instructions:
  - 项目管理、被评估对象管理和苗木评估当前使用 JdbcTemplate 直接访问 PostgreSQL
  - PostgreSQL 插入主键回填采用 INSERT ... RETURNING id，避免使用 GeneratedKeyHolder 读取整行返回值

[当前已落地业务模块]
- Date: 2026-05-10
- Context: Agent 在执行附属物评估开发任务时发现
- Category: 代码模式
- Instructions:
  - 苗木评估和附属物评估当前都已接入 PostgreSQL 持久化
  - 附属物评估明细通过 asset_type 区分 STRUCTURE、EQUIPMENT_MOVE、SEEDLING_MOVE 三类资产

[当前前端页面覆盖范围]
- Date: 2026-05-10
- Context: Agent 在执行页面全量可用化任务时发现
- Category: 代码模式
- Instructions:
  - 当前前端已展示的项目管理、苗木评估、附属物评估、房屋评估、价格库、用户管理、导入中心页面都已接入真实 PostgreSQL CRUD
  - 房屋评估按单表模式实现，评估总值由建筑面积、单价和四个系数相乘计算

[当前前端交互优化基线]
- Date: 2026-05-10
- Context: Agent 在执行前端可用性优化任务时发现
- Category: 代码模式
- Instructions:
  - 核心 CRUD 列表页统一补充本地关键词筛选、删除确认弹窗和保存后表单重置
  - 编辑态表单标题和主按钮文案需要跟随新增态、编辑态自动切换

[当前前端表单校验基线]
- Date: 2026-05-10
- Context: Agent 在执行前端表单校验优化任务时发现
- Category: 代码模式
- Instructions:
  - 项目、对象、用户、价格项页面采用 Element Plus 表单规则做必填和基础格式校验
  - 三类评估页面在提交前执行最小业务校验，重点检查项目对象选择、单号填写和明细数量单价有效性
