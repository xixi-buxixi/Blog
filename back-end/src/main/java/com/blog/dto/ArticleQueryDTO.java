package com.blog.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 文章查询DTO
 *
 * @author blog
 */
@Data
public class ArticleQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 当前页码
     */
    private Long current = 1L;

    /**
     * 每页大小
     */
    private Long size = 10L;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 关键词(标题/摘要)
     */
    private String keyword;

    /**
     * 状态(0草稿/1发布)
     */
    private Integer status;

}