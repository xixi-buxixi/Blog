package com.blog.service.impl;

import cn.hutool.core.util.StrUtil;
import com.blog.common.Constants;
import com.blog.common.PageResult;
import com.blog.dto.CommentDTO;
import com.blog.entity.Article;
import com.blog.entity.Comment;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import com.blog.service.CommentService;
import com.blog.vo.CommentVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 评论服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    /**
     * HTML标签正则表达式
     */
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

    /**
     * 邮箱脱敏正则表达式
     */
    private static final Pattern EMAIL_MASK_PATTERN = Pattern.compile("(?<=.{1}).(?=.*@)");

    @Override
    public PageResult<CommentVO> getCommentsByArticleId(Long articleId, Long current, Long size) {
        // 参数校验
        if (articleId == null) {
            throw new BusinessException("文章ID不能为空");
        }
        if (current == null || current < 1) {
            current = Constants.DEFAULT_PAGE;
        }
        if (size == null || size < 1) {
            size = Constants.DEFAULT_PAGE_SIZE;
        }

        // 计算偏移量
        long offset = (current - 1) * size;

        // 查询顶级评论列表
        List<CommentVO> topComments = commentMapper.selectTopCommentsByArticleId(articleId, offset, size);

        // 递归填充子回复
        for (CommentVO comment : topComments) {
            fillCommentDetails(comment);
        }

        // 统计顶级评论总数(用于分页)
        Long total = commentMapper.countTopCommentsByArticleId(articleId);

        return new PageResult<>(current, size, total, topComments);
    }

    @Override
    public Long getCommentCount(Long articleId) {
        if (articleId == null) {
            throw new BusinessException("文章ID不能为空");
        }
        return commentMapper.countCommentsByArticleId(articleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createComment(CommentDTO commentDTO) {
        // 1. 校验文章是否存在且已发布
        Article article = articleMapper.selectById(commentDTO.getArticleId());
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        if (article.getStatus() != Constants.ARTICLE_STATUS_PUBLISHED) {
            throw new BusinessException("文章未发布,无法评论");
        }

        // 2. 校验昵称和邮箱(必填)
        if (StrUtil.isBlank(commentDTO.getNickname())) {
            throw new BusinessException("昵称不能为空");
        }
        if (StrUtil.isBlank(commentDTO.getEmail())) {
            throw new BusinessException("邮箱不能为空");
        }

        String nickname = sanitizeInput(commentDTO.getNickname());
        String email = commentDTO.getEmail().trim();

        // 3. 校验评论内容
        String content = sanitizeInput(commentDTO.getContent());
        if (StrUtil.isBlank(content)) {
            throw new BusinessException("评论内容不能为空");
        }
        if (content.length() > Constants.COMMENT_CONTENT_MAX_LENGTH) {
            throw new BusinessException("评论内容过长");
        }

        // 4. 处理评论层级逻辑
        Long parentId = commentDTO.getParentId();
        Long replyToId = commentDTO.getReplyToId();

        if (parentId == null && replyToId == null) {
            // 顶级评论:parentId和replyToId都为null
            parentId = null;
            replyToId = null;
        } else if (parentId != null && replyToId != null) {
            // 回复评论:需要校验层级
            Comment parentComment = commentMapper.selectById(parentId);
            if (parentComment == null) {
                throw new BusinessException("父评论不存在");
            }

            Comment replyToComment = commentMapper.selectById(replyToId);
            if (replyToComment == null) {
                throw new BusinessException("回复目标评论不存在");
            }

            // 校验层级关系
            if (parentComment.getParentId() == null) {
                // 父评论是顶级评论
                if (replyToComment.getParentId() == null) {
                    // 一级回复:replyToId指向顶级评论
                    if (!replyToId.equals(parentId)) {
                        throw new BusinessException("一级回复的replyToId必须等于parentId");
                    }
                } else {
                    // 二级回复:replyToId指向一级回复
                    if (!replyToComment.getParentId().equals(parentId)) {
                        throw new BusinessException("二级回复的parentId必须与一级回复的parentId相同");
                    }
                    // 校验不能回复二级评论(已是最深层级)
                    if (replyToComment.getReplyToId() != null && !replyToComment.getReplyToId().equals(parentId)) {
                        throw new BusinessException("不能回复该评论,已达到最大层级");
                    }
                }
            } else {
                // 父评论不是顶级评论,说明已经超过允许的层级
                throw new BusinessException("不能在该评论下回复,已达到最大层级");
            }
        } else {
            // parentId和replyToId必须同时为null或同时不为null
            throw new BusinessException("评论参数错误");
        }

        // 5. 创建评论实体
        Comment comment = new Comment();
        comment.setArticleId(commentDTO.getArticleId());
        comment.setParentId(parentId);
        comment.setReplyToId(replyToId);
        comment.setNickname(nickname);
        comment.setEmail(email);
        comment.setContent(content);
        comment.setStatus(Constants.COMMENT_STATUS_PUBLISHED); // 默认直接发布
        comment.setDeleted(0);

        // 6. 保存评论
        commentMapper.insert(comment);

        log.info("创建评论成功: id={}, articleId={}, nickname={}", comment.getId(), comment.getArticleId(), nickname);
        return comment.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(Long id) {
        // 1. 查询评论
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException(404, "评论不存在");
        }

        // 2. 删除评论(逻辑删除)
        commentMapper.deleteById(id);

        // 3. 如果是顶级评论,删除所有子评论
        if (comment.getParentId() == null) {
            commentMapper.deleteByParentId(id);
        }

        log.info("删除评论成功: id={}", id);
    }

    @Override
    public PageResult<CommentVO> getCommentsForManage(Long current, Long size, Long articleId) {
        if (current == null || current < 1) {
            current = Constants.DEFAULT_PAGE;
        }
        if (size == null || size < 1) {
            size = Constants.DEFAULT_PAGE_SIZE;
        }

        long offset = (current - 1) * size;
        List<CommentVO> comments = commentMapper.selectCommentsForManage(offset, size, articleId);
        Long total = commentMapper.countCommentsForManage(articleId);

        return new PageResult<>(current, size, total, comments);
    }

    /**
     * 递归填充评论详情(子回复)
     *
     * @param comment 评论VO
     */
    private void fillCommentDetails(CommentVO comment) {
        // 邮箱脱敏
        if (StrUtil.isNotBlank(comment.getEmail())) {
            comment.setEmail(maskEmail(comment.getEmail()));
        }

        // 查询子回复
        List<CommentVO> replies = commentMapper.selectRepliesByParentId(comment.getId());
        if (replies != null && !replies.isEmpty()) {
            comment.setReplies(new ArrayList<>());
            for (CommentVO reply : replies) {
                fillCommentDetails(reply);
                comment.getReplies().add(reply);
            }
        } else {
            comment.setReplies(new ArrayList<>());
        }
    }

    /**
     * 输入内容清洗(XSS防护)
     *
     * @param input 输入内容
     * @return 清洗后的内容
     */
    private String sanitizeInput(String input) {
        if (StrUtil.isBlank(input)) {
            return input;
        }
        // 移除HTML标签
        String sanitized = HTML_TAG_PATTERN.matcher(input).replaceAll("");
        // 移除特殊字符
        sanitized = sanitized.replaceAll("[<>\"'&]", "");
        return sanitized.trim();
    }

    /**
     * 邮箱脱敏
     *
     * @param email 邮箱地址
     * @return 脱敏后的邮箱
     */
    private String maskEmail(String email) {
        if (StrUtil.isBlank(email) || !email.contains("@")) {
            return email;
        }
        // 例如: test@example.com -> t***@example.com
        return EMAIL_MASK_PATTERN.matcher(email).replaceAll("***");
    }

}