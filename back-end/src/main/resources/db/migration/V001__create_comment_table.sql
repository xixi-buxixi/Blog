-- 评论表迁移脚本
-- 执行前请确保已创建 blog_db 数据库

-- 创建评论表
CREATE TABLE IF NOT EXISTS `t_comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID（顶级评论为NULL）',
    `reply_to_id` BIGINT DEFAULT NULL COMMENT '回复目标评论ID',
    `nickname` VARCHAR(50) NOT NULL COMMENT '评论者昵称',
    `email` VARCHAR(100) NOT NULL COMMENT '评论者邮箱',
    `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0待审核/1已发布/2已删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0未删除/1已删除',
    PRIMARY KEY (`id`),
    INDEX `idx_article_id` (`article_id`) COMMENT '文章索引',
    INDEX `idx_parent_id` (`parent_id`) COMMENT '父评论索引',
    INDEX `idx_create_time` (`create_time`) COMMENT '时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';