package com.blog.service.impl;

import com.blog.common.Constants;
import com.blog.dto.CommentDTO;
import com.blog.entity.Article;
import com.blog.entity.Comment;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CommentServiceImplTest {

    @Test
    void createCommentReturnsExistingIdForRecentDuplicate() {
        CommentMapper commentMapper = mock(CommentMapper.class);
        ArticleMapper articleMapper = mock(ArticleMapper.class);
        CommentServiceImpl service = newService(commentMapper, articleMapper);
        CommentDTO dto = topLevelComment();
        Article article = publishedArticle();

        when(articleMapper.selectById(dto.getArticleId())).thenReturn(article);
        when(commentMapper.selectRecentDuplicateCommentId(
                eq(dto.getArticleId()),
                eq(null),
                eq(null),
                eq(dto.getNickname()),
                eq(dto.getEmail()),
                eq(dto.getContent()),
                any(LocalDateTime.class)
        )).thenReturn(88L);

        Long result = service.createComment(dto);

        assertEquals(88L, result);
        verify(commentMapper, never()).insert(any(Comment.class));
    }

    @Test
    void createCommentSetsShanghaiCreateTimeBeforeInsert() {
        CommentMapper commentMapper = mock(CommentMapper.class);
        ArticleMapper articleMapper = mock(ArticleMapper.class);
        CommentServiceImpl service = newService(commentMapper, articleMapper);
        CommentDTO dto = topLevelComment();

        when(articleMapper.selectById(dto.getArticleId())).thenReturn(publishedArticle());
        when(commentMapper.selectRecentDuplicateCommentId(anyLong(), eq(null), eq(null), any(), any(), any(), any()))
                .thenReturn(null);

        LocalDateTime before = LocalDateTime.now(ZoneId.of("Asia/Shanghai")).minusSeconds(1);
        service.createComment(dto);
        LocalDateTime after = LocalDateTime.now(ZoneId.of("Asia/Shanghai")).plusSeconds(1);

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentMapper).insert(captor.capture());
        Comment inserted = captor.getValue();

        assertNotNull(inserted.getCreateTime());
        assertNotNull(inserted.getUpdateTime());
        assertEquals(inserted.getCreateTime(), inserted.getUpdateTime());
        assertTrue(!inserted.getCreateTime().isBefore(before) && !inserted.getCreateTime().isAfter(after));
    }

    private static CommentServiceImpl newService(CommentMapper commentMapper, ArticleMapper articleMapper) {
        CommentServiceImpl service = new CommentServiceImpl();
        ReflectionTestUtils.setField(service, "commentMapper", commentMapper);
        ReflectionTestUtils.setField(service, "articleMapper", articleMapper);
        return service;
    }

    private static CommentDTO topLevelComment() {
        CommentDTO dto = new CommentDTO();
        dto.setArticleId(1L);
        dto.setNickname("visitor");
        dto.setEmail("visitor@example.com");
        dto.setContent("hello from comment");
        return dto;
    }

    private static Article publishedArticle() {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(Constants.ARTICLE_STATUS_PUBLISHED);
        return article;
    }
}
