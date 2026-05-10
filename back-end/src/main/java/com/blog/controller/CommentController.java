package com.blog.controller;

import com.blog.common.Constants;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.dto.CommentDTO;
import com.blog.service.CommentService;
import com.blog.vo.CommentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 评论控制器
 *
 * @author blog
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/comments")
@Tag(name = "评论管理", description = "评论CRUD接口")
public class CommentController {

    @Autowired
    private CommentService commentService;

    /**
     * 获取文章评论列表(分页,带嵌套回复) - 公开API
     *
     * @param articleId 文章ID
     * @param page      页码(可选)
     * @param size      每页大小(可选)
     * @return 分页评论列表
     */
    @GetMapping("/article/{articleId}")
    @Operation(summary = "获取文章评论列表")
    public Result<PageResult<CommentVO>> getCommentsByArticleId(
            @Parameter(description = "文章ID") @PathVariable Long articleId,
            @Parameter(description = "页码") @RequestParam(required = false) Long page,
            @Parameter(description = "每页大小") @RequestParam(required = false) Long size
    ) {
        Long current = page != null ? page : Constants.DEFAULT_PAGE;
        Long pageSize = size != null ? size : Constants.DEFAULT_PAGE_SIZE;

        PageResult<CommentVO> pageResult = commentService.getCommentsByArticleId(articleId, current, pageSize);
        return Result.success(pageResult);
    }

    /**
     * 获取文章评论数量 - 公开API
     *
     * @param articleId 文章ID
     * @return 评论数量
     */
    @GetMapping("/article/{articleId}/count")
    @Operation(summary = "获取文章评论数量")
    public Result<Map<String, Long>> getCommentCount(
            @Parameter(description = "文章ID") @PathVariable Long articleId
    ) {
        Long count = commentService.getCommentCount(articleId);
        Map<String, Long> data = new HashMap<>();
        data.put("total", count);
        return Result.success(data);
    }

    /**
     * 发表评论 - 公开API
     *
     * @param commentDTO 评论DTO
     * @return 评论ID
     */
    @PostMapping
    @Operation(summary = "发表评论")
    public Result<Long> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        Long commentId = commentService.createComment(commentDTO);
        return Result.success(commentId);
    }

    /**
     * 删除评论 - 需要登录(后台管理)
     *
     * @param id 评论ID
     * @return 成功响应
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除评论")
    public Result<Void> deleteComment(@Parameter(description = "评论ID") @PathVariable Long id) {
        commentService.deleteComment(id);
        return Result.success();
    }

    /**
     * 获取所有评论列表(后台管理) - 需要登录
     *
     * @param page      页码
     * @param size      每页大小
     * @param articleId 文章ID(可选)
     * @return 分页评论列表
     */
    @GetMapping("/manage")
    @Operation(summary = "获取所有评论列表(后台管理)")
    public Result<PageResult<CommentVO>> getCommentsForManage(
            @Parameter(description = "页码") @RequestParam(required = false) Long page,
            @Parameter(description = "每页大小") @RequestParam(required = false) Long size,
            @Parameter(description = "文章ID") @RequestParam(required = false) Long articleId
    ) {
        Long current = page != null ? page : Constants.DEFAULT_PAGE;
        Long pageSize = size != null ? size : Constants.DEFAULT_PAGE_SIZE;

        PageResult<CommentVO> pageResult = commentService.getCommentsForManage(current, pageSize, articleId);
        return Result.success(pageResult);
    }

}