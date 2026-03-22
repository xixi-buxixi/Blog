package com.blog.controller;

import com.blog.common.Result;
import com.blog.dto.CategoryDTO;
import com.blog.service.CategoryService;
import com.blog.vo.CategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器
 *
 * @author blog
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "分类管理", description = "分类CRUD接口")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * 分类列表
     */
    @GetMapping
    @Operation(summary = "分类列表")
    public Result<List<CategoryVO>> getCategoryList() {
        List<CategoryVO> categoryList = categoryService.getCategoryList();
        return Result.success(categoryList);
    }

    /**
     * 创建分类
     */
    @PostMapping
    @Operation(summary = "创建分类")
    public Result<Long> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        Long categoryId = categoryService.createCategory(categoryDTO);
        return Result.success(categoryId);
    }

    /**
     * 更新分类
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新分类")
    public Result<Void> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        categoryService.updateCategory(id, categoryDTO);
        return Result.success();
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

}