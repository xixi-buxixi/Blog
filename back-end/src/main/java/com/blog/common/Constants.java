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

}