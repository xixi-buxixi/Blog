package com.blog.service;

/**
 * 文章浏览记录服务接口
 *
 * @author blog
 */
public interface ArticleViewRecordService {

    /**
     * 检查并记录浏览
     *
     * @param articleId 文章ID
     * @return true表示首次浏览（需要增加浏览量），false表示已浏览过
     */
    boolean checkAndRecordView(Long articleId);

    /**
     * 清理过期浏览记录
     */
    void cleanExpiredRecords();
}