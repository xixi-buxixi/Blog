package com.blog.common;

/**
 * 系统常量
 *
 * @author blog
 */
public class Constants {

    private Constants() {
    }

    /**
     * 文章状态 - 草稿
     */
    public static final Integer ARTICLE_STATUS_DRAFT = 0;

    /**
     * 文章状态 - 发布
     */
    public static final Integer ARTICLE_STATUS_PUBLISHED = 1;

    /**
     * 默认页码
     */
    public static final Long DEFAULT_PAGE = 1L;

    /**
     * 默认每页大小
     */
    public static final Long DEFAULT_PAGE_SIZE = 10L;

    /**
     * 用户角色 - 管理员
     */
    public static final String ROLE_ADMIN = "ADMIN";

    /**
     * 浏览记录保留天数
     */
    public static final Integer VIEW_RECORD_RETENTION_DAYS = 30;

    /**
     * 评论状态 - 待审核
     */
    public static final Integer COMMENT_STATUS_PENDING = 0;

    /**
     * 评论状态 - 已发布
     */
    public static final Integer COMMENT_STATUS_PUBLISHED = 1;

    /**
     * 评论状态 - 已删除
     */
    public static final Integer COMMENT_STATUS_DELETED = 2;

    /**
     * 评论内容最大长度
     */
    public static final Integer COMMENT_CONTENT_MAX_LENGTH = 500;

    /**
     * 评论昵称最小长度
     */
    public static final Integer COMMENT_NICKNAME_MIN_LENGTH = 2;

    /**
     * 评论昵称最大长度
     */
    public static final Integer COMMENT_NICKNAME_MAX_LENGTH = 50;

}