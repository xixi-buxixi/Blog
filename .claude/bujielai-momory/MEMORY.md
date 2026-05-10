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
    │   │   └ WebConfig.java
    │   ├── controller/              # 控制器
    │   │   ├── AuthController.java
    │   │   ├── ArticleController.java
    │   │   ├── CategoryController.java
    │   │   └── CommentController.java    # 评论控制器(新增)
    │   ├── dto/                     # 数据传输对象
    │   │   ├── LoginDTO.java
    │   │   ├── ArticleDTO.java
    │   │   ├── ArticleQueryDTO.java
    │   │   ├── CategoryDTO.java
    │   │   └── CommentDTO.java          # 评论DTO(新增)
    │   ├── entity/                  # 实体类(PO)
    │   │   ├── User.java
    │   │   ├── Article.java
    │   │   ├── Category.java
    │   │   └── Comment.java             # 评论实体(新增)
    │   ├── exception/               # 异常处理
    │   │   ├── BusinessException.java
    │   │   └ GlobalExceptionHandler.java
    │   ├── interceptor/             # 拦截器
    │   │   └── JwtInterceptor.java      # JWT拦截器(已更新:添加评论公开API)
    │   ├── mapper/                  # Mapper接口
    │   │   ├── UserMapper.java
    │   │   ├── ArticleMapper.java
    │   │   ├── CategoryMapper.java
    │   │   └── CommentMapper.java       # 评论Mapper(新增)
    │   ├── service/                 # 服务层
    │   │   ├── UserService.java
    │   │   ├── ArticleService.java
    │   │   ├── CategoryService.java
    │   │   ├── CommentService.java      # 评论服务接口(新增)
    │   │   └── impl/                # 服务实现
    │   │       ├── UserServiceImpl.java
    │   │       ├── ArticleServiceImpl.java
    │   │       ├── CategoryServiceImpl.java
    │   │       └── CommentServiceImpl.java  # 评论服务实现(新增)
    │   ├── util/                    # 工具类
    │   │   ├── JwtUtils.java
    │   │   └ UserContext.java
    │   └── vo/                      # 视图对象
    │       ├── LoginVO.java
    │       ├── ArticleVO.java
    │       ├── ArticleListVO.java
    │       ├── ArticleStatsVO.java
    │       ├── CategoryVO.java
    │       └── CommentVO.java           # 评论VO(新增)
    └── resources/
        ├── application.yml          # 主配置
        ├── application-dev.yml      # 开发环境配置
        ├── db/migration/            # 数据库迁移脚本
        │   └ V001__create_comment_table.sql  # 评论表迁移脚本
        └── mapper/                  # MyBatis XML
            ├── UserMapper.xml
            ├── ArticleMapper.xml
            ├── CategoryMapper.xml
            └── CommentMapper.xml        # 评论Mapper XML(新增)
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
- 密码: your_admin_password

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

### 评论模块 (新增)
- GET /api/v1/comments/article/{articleId} - 获取文章评论列表(无需认证)
- GET /api/v1/comments/article/{articleId}/count - 获取评论数量(无需认证)
- POST /api/v1/comments - 发表评论(游客无需认证,登录用户需认证)
- DELETE /api/v1/comments/{id} - 删除评论(需认证)

## 评论功能实现要点

### 1. 评论层级规则
- 顶级评论: parentId=null, replyToId=null
- 一级回复: parentId=顶级评论ID, replyToId=顶级评论ID
- 二级回复: parentId=顶级评论ID, replyToId=一级回复ID
- 最多支持2层嵌套,二级回复不能被回复

### 2. 权限规则
- 游客可以发表评论(需填写昵称和邮箱)
- 登录用户发表评论自动使用用户信息
- 仅评论作者或管理员可删除评论

### 3. 安全措施
- XSS防护: 评论内容过滤HTML标签
- 邮箱脱敏: 游客邮箱前端只显示部分(如 t***@example.com)
- 输入验证: 昵称2-50字符,评论内容最多500字符

### 4. 公开API配置
- 评论查询接口(GET)已配置为公开访问,无需JWT认证
- 发表评论接口(POST)游客无需认证,登录用户需认证
- 删除评论接口(DELETE)必须认证

## 常量定义

```java
// 评论状态
COMMENT_STATUS_PENDING = 0    // 待审核
COMMENT_STATUS_PUBLISHED = 1  // 已发布
COMMENT_STATUS_DELETED = 2    // 已删除

// 评论限制
COMMENT_CONTENT_MAX_LENGTH = 500    // 评论内容最大长度
COMMENT_NICKNAME_MIN_LENGTH = 2     // 昵称最小长度
COMMENT_NICKNAME_MAX_LENGTH = 50    // 昵称最大长度

// 用户角色
ROLE_ADMIN = "ADMIN"  // 管理员角色
```

## 开发注意事项

1. 所有新增的评论相关类已按照项目现有风格实现
2. 使用MyBatis-Plus注解@TableLogic实现逻辑删除
3. 使用Lombok简化实体类代码
4. Service层严格区分DTO/VO/PO的使用场景
5. Mapper XML使用自定义SQL实现复杂的嵌套查询
6. BusinessException构造函数参数顺序: (Integer code, String message)
7. JwtInterceptor已更新公开API路径配置
8. XSS过滤使用正则表达式移除HTML标签和特殊字符
9. 邮箱脱敏使用正则表达式替换中间字符