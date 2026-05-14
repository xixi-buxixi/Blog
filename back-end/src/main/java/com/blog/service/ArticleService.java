package com.blog.service;

import com.blog.common.PageResult;
import com.blog.dto.ArticleDTO;
import com.blog.dto.ArticleQueryDTO;
import com.blog.vo.ArticleListVO;
import com.blog.vo.ArticleStatsVO;
import com.blog.vo.ArticleVO;

/**
 * 文章服务接口
 *
 * @author blog
 */
public interface ArticleService {

    /**
     * 分页查询文章列表
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<ArticleListVO> getArticleList(ArticleQueryDTO queryDTO);

    /**
     * 查询文章详情
     *
     * @param id 文章ID
     * @return 文章详情
     */
    ArticleVO getArticleById(Long id);

    /**
     * 查询文章详情
     *
     * @param id                 文章ID
     * @param includeUnpublished 是否允许返回未发布文章
     * @return 文章详情
     */
    ArticleVO getArticleById(Long id, boolean includeUnpublished);

    /**
     * 创建文章
     *
     * @param articleDTO 文章DTO
     * @return 文章ID
     */
    Long createArticle(ArticleDTO articleDTO);

    /**
     * 更新文章
     *
     * @param id         文章ID
     * @param articleDTO 文章DTO
     */
    void updateArticle(Long id, ArticleDTO articleDTO);

    /**
     * 删除文章
     *
     * @param id 文章ID
     */
    void deleteArticle(Long id);

    /**
     * 获取文章统计数据
     *
     * @return 统计数据
     */
    ArticleStatsVO getArticleStats();

}
