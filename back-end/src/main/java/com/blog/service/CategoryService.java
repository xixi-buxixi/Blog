package com.blog.service;

import com.blog.dto.CategoryDTO;
import com.blog.vo.CategoryVO;

import java.util.List;

/**
 * 分类服务接口
 *
 * @author blog
 */
public interface CategoryService {

    /**
     * 查询所有分类
     *
     * @return 分类列表
     */
    List<CategoryVO> getCategoryList();

    /**
     * 创建分类
     *
     * @param categoryDTO 分类DTO
     * @return 分类ID
     */
    Long createCategory(CategoryDTO categoryDTO);

    /**
     * 更新分类
     *
     * @param id          分类ID
     * @param categoryDTO 分类DTO
     */
    void updateCategory(Long id, CategoryDTO categoryDTO);

    /**
     * 删除分类
     *
     * @param id 分类ID
     */
    void deleteCategory(Long id);

    /**
     * 根据ID查询分类
     *
     * @param id 分类ID
     * @return 分类
     */
    com.blog.entity.Category getById(Long id);

}