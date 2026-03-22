# 个人博客系统需求文档（精简版）

## 1. 项目概述

### 1.1 项目名称
Personal Blog System

### 1.2 项目目标
构建一个轻量级的个人博客系统，支持文章发布、分类管理和评论互动等核心功能。

### 1.3 项目结构

本项目采用前后端分离架构，共包含 **3个独立项目**：

| 项目名称 | 技术栈 | 说明 |
|----------|--------|------|
| blog-frontend | Astro 5 + React | 博客前台（用户访问） |
| blog-admin | React 18 + Ant Design | 后台管理系统（管理员使用） |
| blog-backend | Java 17 + Spring Boot 3 | 后端API服务 |

### 1.4 技术栈详情

| 层级 | 技术 |
|------|------|
| 博客前台 | Astro 5 + React + TailwindCSS |
| 后台管理 | React 18 + Ant Design 5 + React Router + Axios |
| 后端服务 | Java 17 + Spring Boot 3 + MyBatis-Plus |
| 数据库 | MySQL 8.0 |
| 认证 | JWT |
| 构建工具 | Vite（前端项目） |

---

## 2. 功能模块

### 2.1 博客前台 (blog-frontend - Astro)

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 首页 | 文章列表展示、分页、按分类筛选 | P0 |
| 文章详情 | 文章内容渲染(Markdown)、代码高亮 | P0 |
| 分类页 | 分类列表、按分类查看文章 | P1 |
| 搜索页 | 按标题/内容搜索文章 | P1 |
| 归档页 | 按时间归档文章（可选） | P2 |

### 2.2 后台管理 (blog-admin - React)

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 登录页 | 管理员登录、Token管理 | P0 |
| 仪表盘 | 文章统计、访问量统计 | P2 |
| 文章管理 | 文章列表、新增/编辑/删除文章、Markdown编辑器 | P0 |
| 分类管理 | 分类CRUD | P1 |

### 2.3 后端服务 (blog-backend - Java)

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 用户模块 | 管理员登录、JWT认证 | P0 |
| 文章模块 | 文章CRUD、分页查询、按分类筛选 | P0 |
| 分类模块 | 分类CRUD | P1 |

---

## 3. 数据库设计

### 3.1 ER关系图（简化）

```
User(1) ----< Article(N) >---- Category(1)
```

### 3.2 数据表结构

#### 3.2.1 用户表 (t_user)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password | VARCHAR(100) | NOT NULL | 加密密码 |
| nickname | VARCHAR(50) | | 昵称 |
| avatar | VARCHAR(255) | | 头像URL |
| role | VARCHAR(20) | DEFAULT 'ADMIN' | 角色 |
| create_time | DATETIME | DEFAULT NOW() | 创建时间 |
| update_time | DATETIME | ON UPDATE NOW() | 更新时间 |

#### 3.2.2 文章表 (t_article)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| summary | VARCHAR(500) | | 摘要 |
| content | LONGTEXT | NOT NULL | 内容(Markdown) |
| cover_image | VARCHAR(255) | | 封面图URL |
| category_id | BIGINT | FK | 分类ID |
| author_id | BIGINT | FK | 作者ID |
| view_count | INT | DEFAULT 0 | 浏览量 |
| status | TINYINT | DEFAULT 1 | 状态(0草稿/1发布) |
| create_time | DATETIME | DEFAULT NOW() | 创建时间 |
| update_time | DATETIME | ON UPDATE NOW() | 更新时间 |

#### 3.2.3 分类表 (t_category)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 分类名称 |
| description | VARCHAR(200) | | 分类描述 |
| sort_order | INT | DEFAULT 0 | 排序 |
| create_time | DATETIME | DEFAULT NOW() | 创建时间 |

---

## 4. API接口设计

### 4.1 接口规范

- 基础路径: `/api/v1`
- 认证方式: Bearer Token (JWT)
- 响应格式: JSON

### 4.2 统一响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 4.3 接口列表

#### 认证模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /auth/login | 管理员登录 | 否 |
| POST | /auth/logout | 退出登录 | 是 |

#### 文章模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /articles | 文章列表(分页) | 否 |
| GET | /articles/{id} | 文章详情 | 否 |
| POST | /articles | 创建文章 | 是 |
| PUT | /articles/{id} | 更新文章 | 是 |
| DELETE | /articles/{id} | 删除文章 | 是 |

#### 分类模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /categories | 分类列表 | 否 |
| POST | /categories | 创建分类 | 是 |
| PUT | /categories/{id} | 更新分类 | 是 |
| DELETE | /categories/{id} | 删除分类 | 是 |

---

## 5. 项目目录结构

### 5.1 博客前台 (blog-frontend - Astro)

```
blog-frontend/
├── public/
│   └── images/              # 静态图片
├── src/
│   ├── components/          # Astro/React组件
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ArticleCard.astro
│   │   └── Pagination.tsx
│   ├── layouts/             # 布局组件
│   │   └── Layout.astro
│   ├── pages/              # 页面路由
│   │   ├── index.astro     # 首页
│   │   ├── article/
│   │   │   └── [id].astro # 文章详情
│   │   ├── category/
│   │   │   └── [id].astro # 分类页
│   │   ├── search.astro    # 搜索页
│   │   └── archive.astro   # 归档页
│   ├── styles/             # 全局样式
│   │   └── global.css
│   └── utils/              # 工具函数
│       └── api.ts          # API请求封装
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### 5.2 后台管理 (blog-admin - React)

```
blog-admin/
├── public/
├── src/
│   ├── api/                 # API请求封装
│   │   ├── auth.js
│   │   ├── article.js
│   │   └── category.js
│   ├── components/          # 公共组件
│   │   ├── Layout/
│   │   │   ├── index.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── MarkdownEditor/
│   │   └── RichTextEditor/
│   ├── pages/               # 页面组件
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Article/
│   │   │   ├── List.jsx
│   │   │   └── Edit.jsx
│   │   └── Category/
│   ├── hooks/               # 自定义Hooks
│   ├── store/               # 状态管理
│   ├── utils/               # 工具函数
│   │   ├── request.js       # Axios封装
│   │   └── auth.js          # Token管理
│   ├── styles/              # 样式文件
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### 5.3 后端服务 (blog-backend - Java)

```
blog-backend/
├── src/main/java/com/blog/
│   ├── config/              # 配置类
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── CorsConfig.java
│   │   └── MyBatisConfig.java
│   ├── controller/          # 控制器
│   │   ├── AuthController.java
│   │   ├── ArticleController.java
│   │   └── CategoryController.java
│   ├── service/             # 业务层
│   │   ├── impl/
│   │   ├── UserService.java
│   │   ├── ArticleService.java
│   │   └── CategoryService.java
│   ├── mapper/              # 数据访问层
│   ├── entity/              # 实体类
│   │   ├── User.java
│   │   ├── Article.java
│   │   └── Category.java
│   ├── dto/                 # 数据传输对象
│   │   ├── ArticleDTO.java
│   │   └── LoginDTO.java
│   ├── vo/                  # 视图对象
│   │   ├── ArticleVO.java
│   │   └── ArticleListVO.java
│   ├── common/              # 公共类
│   │   ├── Result.java
│   │   ├── PageResult.java
│   │   └── Constants.java
│   ├── exception/            # 异常处理
│   │   ├── GlobalException.java
│   │   └── GlobalExceptionHandler.java
│   └── BlogApplication.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── mapper/              # MyBatis XML
└── pom.xml
```

---

## 6. 开发计划

### Phase 1 - 项目初始化 (Week 1)
- [ ] 创建后端项目(blog-backend)，配置Spring Boot + MyBatis-Plus
- [ ] 数据库建表，编写初始SQL脚本
- [ ] 创建前台项目(blog-frontend)，配置Astro + TailwindCSS
- [ ] 创建后台项目(blog-admin)，配置React + Ant Design
- [ ] 实现JWT认证模块

### Phase 2 - 核心功能开发 (Week 2)
- [ ] 后端：文章模块API + 分类模块API
- [ ] 前台：首页文章列表 + 文章详情页
- [ ] 后台：登录页 + 文章管理页面 + Markdown编辑器
- [ ] 联调测试

### Phase 3 - 完善与优化 (Week 3)
- [ ] 前台：分类页 + 搜索页
- [ ] 后台：分类管理
- [ ] 样式优化、SEO优化、测试

---

## 7. 项目启动命令

### 7.1 后端服务
```bash
cd blog-backend
mvn spring-boot:run
# 默认端口: 8080
```

### 7.2 博客前台
```bash
cd blog-frontend
npm install
npm run dev
# 默认端口: 4321
```

### 7.3 后台管理
```bash
cd blog-admin
npm install
npm run dev
# 默认端口: 5173
```

---

## 8. 后续扩展（暂不实现）

- 文章标签系统
- 文章归档页
- RSS订阅
- 图片上传与CDN
- 第三方登录
- 暗黑模式
- 文章访问统计
- 全文检索（Elasticsearch）