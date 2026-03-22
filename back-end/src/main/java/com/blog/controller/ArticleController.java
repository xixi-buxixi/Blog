package com.blog.controller;

import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.dto.ArticleDTO;
import com.blog.dto.ArticleQueryDTO;
import com.blog.service.ArticleService;
import com.blog.vo.ArticleListVO;
import com.blog.vo.ArticleVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 文章控制器
 *
 * @author blog
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/articles")
@Tag(name = "文章管理", description = "文章CRUD接口")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    /**
     * 文章列表(分页)
     */
    @GetMapping
    @Operation(summary = "文章列表")
    public Result<PageResult<ArticleListVO>> getArticleList(ArticleQueryDTO queryDTO) {
        PageResult<ArticleListVO> pageResult = articleService.getArticleList(queryDTO);
        return Result.success(pageResult);
    }

    /**
     * 文章详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "文章详情")
    public Result<ArticleVO> getArticleById(@PathVariable Long id) {
        ArticleVO articleVO = articleService.getArticleById(id);
        return Result.success(articleVO);
    }

    /**
     * 创建文章
     */
    @PostMapping
    @Operation(summary = "创建文章")
    public Result<Long> createArticle(@Valid @RequestBody ArticleDTO articleDTO) {
        Long articleId = articleService.createArticle(articleDTO);
        return Result.success(articleId);
    }

    /**
     * 更新文章
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新文章")
    public Result<Void> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleDTO articleDTO) {
        articleService.updateArticle(id, articleDTO);
        return Result.success();
    }

    /**
     * 删除文章
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除文章")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success();
    }

}