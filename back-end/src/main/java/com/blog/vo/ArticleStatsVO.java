package com.blog.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 文章统计数据VO
 *
 * @author blog
 */
@Data
public class ArticleStatsVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 文章总数
     */
    private Long totalArticles;

    /**
     * 已发布文章数
     */
    private Long publishedArticles;

    /**
     * 草稿文章数
     */
    private Long draftArticles;

    /**
     * 总浏览量
     */
    private Long totalViews;

    /**
     * 分类数量
     */
    private Long categoryCount;
}