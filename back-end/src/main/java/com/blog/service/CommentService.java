package com.blog.service;

import com.blog.common.PageResult;
import com.blog.dto.CommentDTO;
import com.blog.vo.CommentVO;

/**
 * 评论服务接口
 *
 * @author blog
 */
public interface CommentService {

    /**
     * 分页查询文章评论列表(带嵌套回复)
     *
     * @param articleId 文章ID
     * @param current   当前页码
     * @param size      每页大小
     * @return 分页结果
     */
    PageResult<CommentVO> getCommentsByArticleId(Long articleId, Long current, Long size);

    /**
     * 统计文章评论数量(包含所有层级)
     *
     * @param articleId 文章ID
     * @return 评论数量
     */
    Long getCommentCount(Long articleId);

    /**
     * 发表评论
     *
     * @param commentDTO 评论DTO
     * @return 评论ID
     */
    Long createComment(CommentDTO commentDTO);

    /**
     * 删除评论
     *
     * @param id 评论ID
     */
    void deleteComment(Long id);

    /**
     * 分页查询所有评论(后台管理用)
     *
     * @param current   当前页码
     * @param size      每页大小
     * @param articleId 文章ID(可选筛选)
     * @return 分页结果
     */
    PageResult<CommentVO> getCommentsForManage(Long current, Long size, Long articleId);

}