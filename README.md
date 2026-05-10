# 资产评估系统

基于 Spring Boot 的资产评估管理系统，支持苗木评估、附属物评估、房屋评估三大模块。

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

## License

MIT License
