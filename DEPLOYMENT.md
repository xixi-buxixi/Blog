# 博客项目部署文档

## 服务器信息

| 项目 | 值 |
|------|------|
| 服务器IP | 111.229.119.195 |
| SSH连接 | `ssh Tencent` |
| 操作系统 | Ubuntu 22.04 |

## 访问地址

| 服务 | 地址 |
|------|------|
| 博客前台 | http://111.229.119.195/ |
| 后台管理 (blog-admin) | http://111.229.119.195/admin/ |
| 管理端 (manager-end) | http://111.229.119.195/manager/ |
| API接口 | http://111.229.119.195/api/v1/ |
| Swagger文档 | http://111.229.119.195/api/v1/swagger-ui.html |

## 登录信息

| 项目 | 值 |
|------|------|
| 管理员用户名 | admin |
| 管理员密码 | admin123 |

## 数据库信息

| 项目 | 值 |
|------|------|
| 数据库名 | blog_db |
| 用户名 | root |
| 密码 | 200575 |
| 字符集 | utf8mb4 |

## 服务状态

| 服务名 | 端口 | 说明 |
|--------|------|------|
| blog-backend | 8080 | Spring Boot 后端API |
| blog-frontend | 4321 | Astro SSR 前端 |
| nginx | 80 | 反向代理 |
| mysql | 3306 | 数据库 |

## 项目结构

```
服务器目录: /var/www/blog/
├── backend/                 # 后端项目
│   ├── blog-backend-1.0.0.jar
│   └── application-prod.yml  # 生产环境配置
├── frontend/                # Astro SSR 前端
│   ├── dist/
│   ├── node_modules/
│   └── package.json
├── admin/                   # blog-admin 静态文件
├── manager/                 # manager-end 静态文件
└── uploads/                 # 上传文件目录
```

---

## 部署步骤

### 1. 服务器环境安装

```bash
# 连接服务器
ssh Tencent

# 更新系统
sudo apt update

# 安装 Java 17
sudo apt install openjdk-17-jdk -y

# 安装 Node.js 20 (如已安装可跳过)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2
```

### 2. 配置 MySQL 数据库

```bash
# 登录 MySQL
sudo mysql -u root -p

# 执行以下 SQL
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '200575';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 本地打包

```bash
# 后端
cd back-end
mvn clean package -DskipTests

# blog-admin 前端
cd front-end/blog-admin
npm install
npm run build

# manager-end 前端
cd manager-end
npm install
npm run build

# blog-frontend (Astro SSR)
cd front-end/blog-frontend
npm install
npm run build
```

### 4. 上传到服务器

```bash
# 创建目录
ssh Tencent "mkdir -p /var/www/blog/{backend,frontend,admin,manager,uploads}"

# 上传后端 JAR 包
scp back-end/target/blog-backend-1.0.0.jar Tencent:/var/www/blog/backend/

# 上传前端静态文件
scp -r front-end/blog-admin/dist/* Tencent:/var/www/blog/admin/
scp -r manager-end/dist/* Tencent:/var/www/blog/manager/

# 上传 Astro SSR 项目
scp -r front-end/blog-frontend/dist front-end/blog-frontend/package.json front-end/blog-frontend/package-lock.json Tencent:/var/www/blog/frontend/
```

### 5. 创建生产环境配置

在服务器上创建 `/var/www/blog/backend/application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/blog_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 200575
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.nologging.NoLoggingImpl

logging:
  level:
    com.blog: info
```

### 6. 初始化数据库表

```bash
ssh Tencent "mysql -u root -p200575 blog_db" << 'EOF'
-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表
CREATE TABLE IF NOT EXISTS t_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章表
CREATE TABLE IF NOT EXISTS t_article (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500),
    content LONGTEXT,
    cover_image VARCHAR(255),
    category_id BIGINT,
    author_id BIGINT,
    view_count INT DEFAULT 0,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员
INSERT INTO t_user (username, password, nickname, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyAVvVcW.Ld5nB.6l8P4Q9r8v2C', '管理员', 'admin');

-- 插入默认分类
INSERT INTO t_category (name, description, sort_order) VALUES
('默认分类', '默认分类', 0);
EOF
```

### 7. 启动服务

```bash
# 安装前端依赖
ssh Tencent "cd /var/www/blog/frontend && npm install --production"
ssh Tencent "cd /var/www/blog/frontend && npm install @rollup/rollup-linux-x64-gnu --save-optional"

# 启动后端
ssh Tencent "cd /var/www/blog/backend && pm2 start java --name 'blog-backend' -- -jar blog-backend-1.0.0.jar --spring.profiles.active=prod --spring.config.location=classpath:/,file:./"

# 启动前端
ssh Tencent "cd /var/www/blog/frontend/dist/server && pm2 start node --name 'blog-frontend' -- entry.mjs --host 0.0.0.0"

# 设置开机自启
ssh Tencent "pm2 startup && pm2 save"
```

### 8. 配置 Nginx

创建 `/etc/nginx/sites-available/blog`:

```nginx
server {
    listen 80;
    server_name 111.229.119.195;

    # 博客前台
    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后台管理 (blog-admin) — 精确匹配重定向尾随斜杠
    location = /admin {
        return 301 /admin/;
    }

    location /admin/ {
        alias /var/www/blog/admin/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 管理端 (manager-end)
    location /manager {
        alias /var/www/blog/manager;
        try_files $uri $uri/ /index.html;
    }

    # ===================================================================
    # Pulse 项目 (AI 社区)
    # ===================================================================

    # 精确匹配: /pulse → /pulse/ (防止 404)
    location = /pulse {
        return 301 /pulse/;
    }

    location /pulse/ {
        alias /var/www/pulse/;
        index index.html;
        try_files $uri $uri/ /pulse/index.html;
    }

    location /pulse/assets/ {
        alias /var/www/pulse/assets/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location /pulse/api/ {
        proxy_pass http://149.13.91.133:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # ===================================================================
    # Environment 项目 (环境监测)
    # ===================================================================

    # 精确匹配: /environment → /environment/ (防止 404)
    location = /environment {
        return 301 /environment/;
    }

    location /environment/ {
        alias /var/www/environment/;
        index index.html;
        try_files $uri $uri/ /environment/index.html;
    }

    location /environment/assets/ {
        alias /var/www/environment/assets/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location /environment/api/ {
        proxy_pass http://149.13.91.133:8083/environment/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # ===================================================================
    # API 代理到 Qiniuyun 后端
    # ===================================================================

    # 博客 API (blog-backend, port 8081)
    location /api {
        proxy_pass http://149.13.91.133:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传文件 — 本地静态文件
    location /uploads {
        alias /var/www/blog/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    # ===================================================================
    # HTTPS (通过 certbot 自动配置)
    # ===================================================================
    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/www.lililiz.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.lililiz.top/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP → HTTPS 重定向
server {
    listen 80 default_server;
    location / {
        return 301 https://$host$request_uri;
    }
}
```

```bash
# 启用站点
ssh Tencent "rm -f /etc/nginx/sites-enabled/default"
ssh Tencent "ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/"
ssh Tencent "nginx -t && systemctl reload nginx"
```

---

## 常用运维命令

### PM2 相关

```bash
# 查看服务状态
ssh Tencent "pm2 status"

# 查看日志
ssh Tencent "pm2 logs blog-backend"
ssh Tencent "pm2 logs blog-frontend"

# 实时查看日志
ssh Tencent "pm2 logs blog-backend --lines 100"

# 重启服务
ssh Tencent "pm2 restart blog-backend"
ssh Tencent "pm2 restart blog-frontend"
ssh Tencent "pm2 restart all"

# 停止服务
ssh Tencent "pm2 stop all"

# 保存当前进程列表
ssh Tencent "pm2 save"
```

### Nginx 相关

```bash
# 测试配置
ssh Tencent "nginx -t"

# 重载配置
ssh Tencent "systemctl reload nginx"

# 重启 Nginx
ssh Tencent "systemctl restart nginx"

# 查看 Nginx 状态
ssh Tencent "systemctl status nginx"
```

### MySQL 相关

```bash
# 登录数据库
ssh Tencent "mysql -u root -p200575 blog_db"

# 备份数据库
ssh Tencent "mysqldump -u root -p200575 blog_db > /var/www/blog/backup_$(date +%Y%m%d).sql"

# 恢复数据库
ssh Tencent "mysql -u root -p200575 blog_db < /var/www/blog/backup.sql"
```

### 日志查看

```bash
# 后端日志
ssh Tencent "tail -100 /root/.pm2/logs/blog-backend-out.log"
ssh Tencent "tail -100 /root/.pm2/logs/blog-backend-error.log"

# 前端日志
ssh Tencent "tail -100 /root/.pm2/logs/blog-frontend-out.log"

# Nginx 日志
ssh Tencent "tail -100 /var/log/nginx/access.log"
ssh Tencent "tail -100 /var/log/nginx/error.log"
```

---

## 更新部署

### 更新后端

```bash
# 本地打包
cd back-end
mvn clean package -DskipTests

# 上传并重启
scp target/blog-backend-1.0.0.jar Tencent:/var/www/blog/backend/
ssh Tencent "pm2 restart blog-backend"
```

### 更新前端 (Astro)

```bash
# 本地打包
cd front-end/blog-frontend
npm run build

# 上传并重启
scp -r dist Tencent:/var/www/blog/frontend/
ssh Tencent "pm2 restart blog-frontend"
```

### 更新管理后台

```bash
# 本地打包
cd manager-end
npm run build

# 上传
scp -r dist/* Tencent:/var/www/blog/manager/
```

---

## 故障排查

### 后端无法连接数据库

```bash
# 检查 MySQL 是否运行
ssh Tencent "systemctl status mysql"

# 检查数据库连接
ssh Tencent "mysql -u root -p200575 -e 'SELECT 1'"
```

### 前端 502 错误

```bash
# 检查服务是否运行
ssh Tencent "pm2 status"

# 检查端口是否被占用
ssh Tencent "lsof -i :4321"
ssh Tencent "lsof -i :8080"
```

### Nginx 配置错误

```bash
# 测试配置语法
ssh Tencent "nginx -t"

# 查看错误日志
ssh Tencent "tail -50 /var/log/nginx/error.log"
```

---

## 技术栈

### 后端
- Java 17
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0
- JWT 认证

### 前端
- Astro 5.x (SSR)
- React 18
- Tailwind CSS
- marked (Markdown渲染)

### 管理后台
- React 18
- Ant Design 5
- Vite 5
- Axios

### 服务器
- Nginx 1.18
- PM2 6.x
- Node.js 20.x