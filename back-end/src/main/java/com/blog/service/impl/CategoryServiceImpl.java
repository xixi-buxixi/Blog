package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.dto.CategoryDTO;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.service.CategoryService;
import com.blog.vo.CategoryVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 分类服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public List<CategoryVO> getCategoryList() {
        return categoryMapper.selectCategoryListWithArticleCount();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createCategory(CategoryDTO categoryDTO) {
        // 检查分类名称是否已存在
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getName, categoryDTO.getName());
        if (categoryMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("分类名称已存在");
        }

        // 创建分类
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setSortOrder(categoryDTO.getSortOrder() != null ? categoryDTO.getSortOrder() : 0);

        categoryMapper.insert(category);

        log.info("创建分类成功: id={}, name={}", category.getId(), category.getName());
        return category.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(Long id, CategoryDTO categoryDTO) {
        // 查询分类
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        // 检查分类名称是否已存在(排除自己)
        if (categoryDTO.getName() != null && !categoryDTO.getName().equals(category.getName())) {
            LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Category::getName, categoryDTO.getName());
            queryWrapper.ne(Category::getId, id);
            if (categoryMapper.selectCount(queryWrapper) > 0) {
                throw new BusinessException("分类名称已存在");
            }
            category.setName(categoryDTO.getName());
        }

        // 更新分类
        if (categoryDTO.getDescription() != null) {
            category.setDescription(categoryDTO.getDescription());
        }
        if (categoryDTO.getSortOrder() != null) {
            category.setSortOrder(categoryDTO.getSortOrder());
        }

        categoryMapper.updateById(category);

        log.info("更新分类成功: id={}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        // 查询分类
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        // 检查分类下是否有文章
        LambdaQueryWrapper<Article> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Article::getCategoryId, id);
        queryWrapper.eq(Article::getDeleted, 0);
        if (articleMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("分类下存在文章，无法删除");
        }

        // 删除分类
        categoryMapper.deleteById(id);

        log.info("删除分类成功: id={}", id);
    }

    @Override
    public Category getById(Long id) {
        return categoryMapper.selectById(id);
    }

}