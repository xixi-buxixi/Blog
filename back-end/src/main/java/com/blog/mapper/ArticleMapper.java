package com.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Article;
import com.blog.vo.ArticleListVO;
import com.blog.vo.ArticleVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文章Mapper接口
 *
 * @author blog
 */
@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    /**
     * 分页查询文章列表
     *
     * @param categoryId 分类ID
     * @param keyword    关键词
     * @param status     状态
     * @param offset     偏移量
     * @param size       每页大小
     * @return 文章列表
     */
    List<ArticleListVO> selectArticleList(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            @Param("status") Integer status,
            @Param("offset") Long offset,
            @Param("size") Long size
    );

    /**
     * 统计文章数量
     *
     * @param categoryId 分类ID
     * @param keyword    关键词
     * @param status     状态
     * @return 数量
     */
    Long countArticle(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            @Param("status") Integer status
    );

    /**
     * 查询文章详情
     *
     * @param id 文章ID
     * @return 文章详情
     */
    ArticleVO selectArticleById(@Param("id") Long id);

    /**
     * 增加浏览量
     *
     * @param id 文章ID
     */
    void incrementViewCount(@Param("id") Long id);

    /**
     * 查询总浏览量
     *
     * @return 总浏览量
     */
    Long selectTotalViewCount();

}