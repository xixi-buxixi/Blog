package com.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.ArticleViewRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

/**
 * 文章浏览记录Mapper接口
 *
 * @author blog
 */
@Mapper
public interface ArticleViewRecordMapper extends BaseMapper<ArticleViewRecord> {

    /**
     * 检查登录用户是否已浏览过该文章
     *
     * @param articleId 文章ID
     * @param userId    用户ID
     * @return 是否已浏览
     */
    boolean existsByArticleIdAndUserId(@Param("articleId") Long articleId, @Param("userId") Long userId);

    /**
     * 检查IP是否已浏览过该文章
     *
     * @param articleId 文章ID
     * @param ipAddress IP地址
     * @return 是否已浏览
     */
    boolean existsByArticleIdAndIpAddress(@Param("articleId") Long articleId, @Param("ipAddress") String ipAddress);

    /**
     * 清理指定时间之前的浏览记录
     *
     * @param beforeTime 截止时间
     * @return 删除记录数
     */
    int deleteByViewTimeBefore(@Param("beforeTime") LocalDateTime beforeTime);
}