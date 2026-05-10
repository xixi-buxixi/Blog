package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.common.Constants;
import com.blog.common.PageResult;
import com.blog.dto.ArticleDTO;
import com.blog.dto.ArticleQueryDTO;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.service.ArticleService;
import com.blog.service.ArticleViewRecordService;
import com.blog.util.UserContext;
import com.blog.vo.ArticleListVO;
import com.blog.vo.ArticleStatsVO;
import com.blog.vo.ArticleVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 文章服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleViewRecordService viewRecordService;

    @Override
    public PageResult<ArticleListVO> getArticleList(ArticleQueryDTO queryDTO) {
        // 计算偏移量
        long current = queryDTO.getCurrent() != null ? queryDTO.getCurrent() : Constants.DEFAULT_PAGE;
        long size = queryDTO.getSize() != null ? queryDTO.getSize() : Constants.DEFAULT_PAGE_SIZE;
        long offset = (current - 1) * size;

        // 查询列表
        List<ArticleListVO> records = articleMapper.selectArticleList(
                queryDTO.getCategoryId(),
                queryDTO.getKeyword(),
                queryDTO.getStatus(),
                offset,
                size
        );

        // 查询总数
        Long total = articleMapper.countArticle(
                queryDTO.getCategoryId(),
                queryDTO.getKeyword(),
                queryDTO.getStatus()
        );

        return new PageResult<>(current, size, total, records);
    }

    @Override
    public ArticleVO getArticleById(Long id) {
        ArticleVO articleVO = articleMapper.selectArticleById(id);
        if (articleVO == null) {
            throw new BusinessException("文章不存在");
        }

        // 检查并记录浏览（首次浏览才增加浏览量）
        if (viewRecordService.checkAndRecordView(id)) {
            articleMapper.incrementViewCount(id);
        }

        return articleVO;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createArticle(ArticleDTO articleDTO) {
        // 校验分类是否存在
        if (articleDTO.getCategoryId() != null) {
            if (categoryMapper.selectById(articleDTO.getCategoryId()) == null) {
                throw new BusinessException("分类不存在");
            }
        }

        // 创建文章实体
        Article article = new Article();
        article.setTitle(articleDTO.getTitle());
        article.setSummary(articleDTO.getSummary());
        article.setContent(articleDTO.getContent());
        article.setCoverImage(articleDTO.getCoverImage());
        article.setCategoryId(articleDTO.getCategoryId());
        article.setAuthorId(UserContext.getUserId());
        article.setViewCount(0);
        article.setStatus(articleDTO.getStatus() != null ? articleDTO.getStatus() : Constants.ARTICLE_STATUS_DRAFT);
        article.setDeleted(0);

        // 保存
        articleMapper.insert(article);

        log.info("创建文章成功: id={}, title={}", article.getId(), article.getTitle());
        return article.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateArticle(Long id, ArticleDTO articleDTO) {
        // 查询文章
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }

        // 校验分类是否存在
        if (articleDTO.getCategoryId() != null) {
            if (categoryMapper.selectById(articleDTO.getCategoryId()) == null) {
                throw new BusinessException("分类不存在");
            }
        }

        // 更新文章
        if (StringUtils.hasText(articleDTO.getTitle())) {
            article.setTitle(articleDTO.getTitle());
        }
        if (articleDTO.getSummary() != null) {
            article.setSummary(articleDTO.getSummary());
        }
        if (StringUtils.hasText(articleDTO.getContent())) {
            article.setContent(articleDTO.getContent());
        }
        if (articleDTO.getCoverImage() != null) {
            article.setCoverImage(articleDTO.getCoverImage());
        }
        if (articleDTO.getCategoryId() != null) {
            article.setCategoryId(articleDTO.getCategoryId());
        }
        if (articleDTO.getStatus() != null) {
            article.setStatus(articleDTO.getStatus());
        }

        articleMapper.updateById(article);

        log.info("更新文章成功: id={}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteArticle(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }

        // 逻辑删除
        articleMapper.deleteById(id);

        log.info("删除文章成功: id={}", id);
    }

    @Override
    public ArticleStatsVO getArticleStats() {
        ArticleStatsVO stats = new ArticleStatsVO();

        // 文章总数
        Long totalArticles = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().eq(Article::getDeleted, 0)
        );
        stats.setTotalArticles(totalArticles);

        // 已发布文章数
        Long publishedArticles = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getDeleted, 0)
                        .eq(Article::getStatus, Constants.ARTICLE_STATUS_PUBLISHED)
        );
        stats.setPublishedArticles(publishedArticles);

        // 草稿文章数
        Long draftArticles = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getDeleted, 0)
                        .eq(Article::getStatus, Constants.ARTICLE_STATUS_DRAFT)
        );
        stats.setDraftArticles(draftArticles);

        // 总浏览量
        Long totalViews = articleMapper.selectTotalViewCount();
        stats.setTotalViews(totalViews != null ? totalViews : 0L);

        // 分类数量
        Long categoryCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<Category>()
        );
        stats.setCategoryCount(categoryCount);

        return stats;
    }

}