# Blog Backend Project Memory

## 项目结构

```
blog-backend/
├── pom.xml                          # Maven配置
├── .gitignore
└── src/main/
    ├── java/com/blog/
    │   ├── BlogApplication.java     # 启动类
    │   ├── common/                  # 公共类
    │   │   ├── Result.java          # 统一响应
    │   │   ├── PageResult.java      # 分页结果
    │   │   └── Constants.java       # 常量
    │   ├── config/                  # 配置类
    │   │   ├── CorsConfig.java
    │   │   ├── JwtConfig.java
    │   │   ├── MyBatisConfig.java
    │   │   ├── OpenApiConfig.java
    │   │   └── WebConfig.java
    │   ├── controller/              # 控制器
    │   │   ├── AuthController.java
    │   │   ├── ArticleController.java
    │   │   └── CategoryController.java
    │   ├── dto/                     # 数据传输对象
    │   │   ├── LoginDTO.java
    │   │   ├── ArticleDTO.java
    │   │   ├── ArticleQueryDTO.java
    │   │   └── CategoryDTO.java
    │   ├── entity/                  # 实体类(PO)
    │   │   ├── User.java
    │   │   ├── Article.java
    │   │   └── Category.java
    │   ├── exception/               # 异常处理
    │   │   ├── BusinessException.java
    │   │   └── GlobalExceptionHandler.java
    │   ├── interceptor/             # 拦截器
    │   │   └── JwtInterceptor.java
    │   ├── mapper/                  # Mapper接口
    │   │   ├── UserMapper.java
    │   │   ├── ArticleMapper.java
    │   │   └── CategoryMapper.java
    │   ├── service/                 # 服务层
    │   │   ├── UserService.java
    │   │   ├── ArticleService.java
    │   │   ├── CategoryService.java
    │   │   └── impl/                # 服务实现
    │   ├── util/                    # 工具类
    │   │   ├── JwtUtils.java
    │   │   └── UserContext.java
    │   └── vo/                      # 视图对象
    │       ├── LoginVO.java
    │       ├── ArticleVO.java
    │       ├── ArticleListVO.java
    │       └── CategoryVO.java
    └── resources/
        ├── application.yml          # 主配置
        ├── application-dev.yml      # 开发环境配置
        ├── db/init.sql              # 数据库初始化脚本
        └── mapper/                  # MyBatis XML
            ├── UserMapper.xml
            ├── ArticleMapper.xml
            └── CategoryMapper.xml
```

## 技术栈

- Java 17
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0
- JWT (jjwt 0.12.3)
- SpringDoc OpenAPI 2.3.0
- Hutool 5.8.24
- Lombok 1.18.30

## 端口

- 服务端口: 8080
- API文档: http://localhost:8080/swagger-ui.html

## 数据库配置

- 数据库名: blog_db
- 默认账号: root/root (需根据实际修改 application-dev.yml)

## 默认管理员账号

- 用户名: admin
- 密码: admin123

## API接口

### 认证模块 (无需认证)
- POST /api/v1/auth/login - 登录
- POST /api/v1/auth/logout - 登出

### 文章模块
- GET /api/v1/articles - 文章列表(分页)
- GET /api/v1/articles/{id} - 文章详情
- POST /api/v1/articles - 创建文章(需认证)
- PUT /api/v1/articles/{id} - 更新文章(需认证)
- DELETE /api/v1/articles/{id} - 删除文章(需认证)

### 分类模块
- GET /api/v1/categories - 分类列表
- POST /api/v1/categories - 创建分类(需认证)
- PUT /api/v1/categories/{id} - 更新分类(需认证)
- DELETE /api/v1/categories/{id} - 删除分类(需认证)