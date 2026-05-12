# 资产评估系统

这是一个前后端分离的资产评估系统项目骨架，支持苗木评估、附属物评估、房屋评估三大模块。

## 当前仓库结构

```text
backend/                后端 Spring Boot 工程骨架
frontend/               前端 Vue 3 + Vite 工程骨架
sql/                    SQL 脚本目录
templates/              Excel 与报告模板目录
.monkeycode/docs/       设计文档与数据库初稿
README.md
苗木模板.xlsx
附属物评估模板.xlsx
```

## 已完成的设计文档

- `.monkeycode/docs/system-design.md`
- `.monkeycode/docs/schema.sql`
- `.monkeycode/docs/implementation-plan.md`

建议先阅读设计文档，再进入具体业务实现。

## 功能特性

- **用户认证**：JWT 无状态认证，支持角色权限管理
- **资产评估模块**：
  - 苗木评估：支持品种、规格、数量、树龄等评估
  - 附属物评估：支持折旧计算
  - 历史价格查询：支持时间范围查询
- **房屋评估模块**：支持朝向、楼层、装修等系数调整
- **数据导入**：支持 Excel 批量导入
- **报告生成**：自动生成 Word 格式评估报告

## 技术栈

- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- MyBatis-Plus
- MySQL 8.0
- Redis
- Apache POI

## 快速开始

### 1. 环境要求

- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 2. 数据库初始化

```bash
mysql -u root -p < sql/init.sql
```

### 3. 修改配置

编辑 `src/main/resources/application.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/asset_evaluation
    username: your_username
    password: your_password
```

### 4. 编译运行

```bash
mvn clean package -DskipTests
java -jar target/asset-evaluation-system-1.0.0.jar
```

### 5. 访问系统

- 基础地址：http://localhost:8080
- 登录接口：POST /api/auth/login
- 用户名：admin
- 密码：admin123

## API 接口

### 认证模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/login | POST | 用户登录 |

### 苗木评估

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/seedling/list | GET | 查询列表 |
| /api/seedling/{id} | GET | 获取详情 |
| /api/seedling | POST | 新增记录 |
| /api/seedling/{id} | PUT | 更新记录 |
| /api/seedling/{id} | DELETE | 删除记录 |
| /api/seedling/{id}/history | GET | 历史价格 |

### 附属物评估

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/appendage/list | GET | 查询列表 |
| /api/appendage/{id} | GET | 获取详情 |
| /api/appendage | POST | 新增记录 |
| /api/appendage/{id} | PUT | 更新记录 |
| /api/appendage/{id} | DELETE | 删除记录 |

### 房屋评估

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/house/list | GET | 查询列表 |
| /api/house/{id} | GET | 获取详情 |
| /api/house | POST | 新增记录 |
| /api/house/{id} | PUT | 更新记录 |
| /api/house/{id} | DELETE | 删除记录 |

### 价格管理

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/price/library | GET | 价格库列表 |
| /api/price/library | POST | 新增价格 |
| /api/price/history | GET | 历史价格 |

### 模板下载

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/template/seedling | GET | 苗木模板 |
| /api/template/appendage | GET | 附属物模板 |
| /api/template/house | GET | 房屋模板 |

### 数据导入

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/import/seedling | POST | 导入苗木数据 |
| /api/import/appendage | POST | 导入附属物数据 |
| /api/import/house | POST | 导入房屋数据 |

### 报告生成

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/report/seedling/{id} | POST | 生成苗木报告 |
| /api/report/appendage/{id} | POST | 生成附属物报告 |
| /api/report/house/{id} | POST | 生成房屋报告 |

## 评估计算公式

### 苗木评估

```
评估总值 = 数量 × 基准单价 × 状况系数 × 树龄系数

状况系数：优 1.0, 良 0.85, 中 0.70, 差 0.50
树龄系数：幼龄 0.80, 中龄 1.00, 成熟 1.20, 过熟 0.90
```

### 附属物评估

```
当前价值 = 原值 × (1 - 折旧率)^使用年限

折旧率：钢结构 2%, 钢筋混凝土 1.5%, 砖木结构 2.5%
```

### 房屋评估

```
评估总值 = 面积 × 单价 × 区域系数 × 楼层系数 × 朝向系数 × 装修系数

楼层系数：根据楼层相对于总楼层比例确定
朝向系数：南 1.00, 东 0.95, 西 0.92, 北 0.88
装修系数：精装 1.20, 普通 1.00, 简装 0.85
```

## 目录结构

```
src/main/java/com/evaluation/
├── config/          # 配置类
├── controller/       # 控制器
├── service/          # 业务逻辑
├── repository/       # 数据访问
├── entity/           # 实体类
├── dto/              # 数据传输对象
├── common/           # 通用组件
└── security/        # 安全模块
```

## Docker 部署

### 前置要求

- Docker 20.10+
- Docker Compose v2+

### 一键启动

```bash
docker compose up -d
```

该命令会自动构建前后端镜像并启动以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend | 80 | Nginx 托管前端静态资源，反向代理 /api 到后端 |
| backend | 8080 | Spring Boot 后端服务 |
| postgres | 5432 | PostgreSQL 数据库 |
| redis | 6379 | Redis 缓存 |

启动完成后访问 http://localhost 即可使用系统。

### 仅重建某个服务

```bash
# 重建并重启后端
docker compose up -d --build backend

# 重建并重启前端
docker compose up -d --build frontend
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看后端日志
docker compose logs -f backend
```

### 停止服务

```bash
docker compose down
```

### 停止并清除数据卷

```bash
docker compose down -v
```

### 环境变量覆盖

后端支持通过环境变量覆盖 application.yml 中的配置：

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| SPRING_DATASOURCE_URL | jdbc:postgresql://postgres:5432/asset_evaluation | 数据库连接地址 |
| SPRING_DATASOURCE_USERNAME | asset_app | 数据库用户名 |
| SPRING_DATASOURCE_PASSWORD | asset_app_123 | 数据库密码 |
| SPRING_DATA_REDIS_HOST | redis | Redis 地址 |

生产环境建议通过 `.env` 文件或 Docker secrets 管理敏感配置。

## License

MIT License
