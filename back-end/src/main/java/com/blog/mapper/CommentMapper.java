package com.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Comment;
import com.blog.vo.CommentVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 评论Mapper接口
 *
 * @author blog
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {

    /**
     * 分页查询文章的顶级评论列表
     *
     * @param articleId 文章ID
     * @param offset    偏移量
     * @param size      每页大小
     * @return 评论列表
     */
    List<CommentVO> selectTopCommentsByArticleId(
            @Param("articleId") Long articleId,
            @Param("offset") Long offset,
            @Param("size") Long size
    );

    /**
     * 查询评论的所有子回复(一级和二级回复)
     *
     * @param parentId 父评论ID(顶级评论ID)
     * @return 子回复列表
     */
    List<CommentVO> selectRepliesByParentId(@Param("parentId") Long parentId);

    /**
     * 统计文章的评论总数(包含所有层级)
     *
     * @param articleId 文章ID
     * @return 评论数量
     */
    Long countCommentsByArticleId(@Param("articleId") Long articleId);

    /**
     * 统计顶级评论数量(用于分页)
     *
     * @param articleId 文章ID
     * @return 顶级评论数量
     */
    Long countTopCommentsByArticleId(@Param("articleId") Long articleId);

    /**
     * 根据父评论ID删除所有子评论(逻辑删除)
     *
     * @param parentId 父评论ID
     */
    void deleteByParentId(@Param("parentId") Long parentId);

    /**
     * 分页查询所有评论(后台管理)
     *
     * @param offset    偏移量
     * @param size      每页大小
     * @param articleId 文章ID(可选)
     * @return 评论列表
     */
    List<CommentVO> selectCommentsForManage(
            @Param("offset") Long offset,
            @Param("size") Long size,
            @Param("articleId") Long articleId
    );

    /**
     * 统计所有评论数量(后台管理)
     *
     * @param articleId 文章ID(可选)
     * @return 评论数量
     */
    Long countCommentsForManage(@Param("articleId") Long articleId);

}