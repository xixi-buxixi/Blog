-- =====================================================
-- 个人博客系统数据库初始化脚本
-- 数据库版本: MySQL 8.0+
-- 创建时间: 2024
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS blog_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- =====================================================
-- 用户表
-- =====================================================
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    role VARCHAR(20) DEFAULT 'ADMIN' COMMENT '角色',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 分类表
-- =====================================================
DROP TABLE IF EXISTS t_category;
CREATE TABLE t_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    description VARCHAR(200) COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- =====================================================
-- 文章表
-- =====================================================
DROP TABLE IF EXISTS t_article;
CREATE TABLE t_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    summary VARCHAR(500) COMMENT '摘要',
    content LONGTEXT NOT NULL COMMENT '内容(Markdown)',
    cover_image VARCHAR(255) COMMENT '封面图URL',
    category_id BIGINT COMMENT '分类ID',
    author_id BIGINT COMMENT '作者ID',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    status TINYINT DEFAULT 1 COMMENT '状态(0草稿/1发布)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除(0未删除/1已删除)',
    KEY idx_category_id (category_id),
    KEY idx_author_id (author_id),
    KEY idx_status (status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入默认管理员账号
-- 密码为: your_admin_password (BCrypt加密后的值)
INSERT INTO t_user (username, password, nickname, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 'ADMIN');

-- 插入默认分类
INSERT INTO t_category (name, description, sort_order) VALUES
('技术分享', '技术文章、教程、经验分享', 1),
('生活随笔', '生活感悟、日常记录', 2),
('项目实战', '项目开发、架构设计相关', 3);

-- 插入示例文章
INSERT INTO t_article (title, summary, content, category_id, author_id, view_count, status) VALUES
('Spring Boot 3.0 新特性详解',
'Spring Boot 3.0 带来了许多令人兴奋的新特性，本文将详细介绍这些变化...',
'# Spring Boot 3.0 新特性详解\n\nSpring Boot 3.0 是一个重要的里程碑版本，带来了许多重大更新。\n\n## 1. 最低要求 Java 17\n\nSpring Boot 3.0 要求最低使用 Java 17...\n\n## 2. Jakarta EE 支持\n\n从 javax 迁移到 jakarta 命名空间...\n\n## 3. 原生编译支持\n\n支持 GraalVM 原生编译...',
1, 1, 100, 1),

('MySQL 8.0 性能优化实践',
'分享 MySQL 8.0 在实际项目中的性能优化经验...',
'# MySQL 8.0 性能优化实践\n\n本文分享一些 MySQL 8.0 的性能优化技巧。\n\n## 索引优化\n\n合理的索引设计是性能优化的关键...\n\n## 查询优化\n\n避免全表扫描，使用 EXPLAIN 分析执行计划...',
1, 1, 80, 1),

('我的2024年学习计划',
'新的一年，新的开始，记录一下我的学习计划...',
'# 我的2024年学习计划\n\n新的一年，给自己定下几个目标：\n\n1. 深入学习 Java 并发编程\n2. 掌握微服务架构设计\n3. 学习 Kubernetes\n4. 多写技术博客\n\n加油！',
2, 1, 50, 1);

-- =====================================================
-- 查询验证
-- =====================================================
SELECT '用户表数据:' AS '';
SELECT * FROM t_user;

SELECT '分类表数据:' AS '';
SELECT * FROM t_category;

SELECT '文章表数据:' AS '';
SELECT id, title, category_id, author_id, view_count, status FROM t_article;