package com.blog.service.impl;

import com.blog.common.Constants;
import com.blog.entity.ArticleViewRecord;
import com.blog.mapper.ArticleViewRecordMapper;
import com.blog.service.ArticleViewRecordService;
import com.blog.util.IpUtils;
import com.blog.util.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 文章浏览记录服务实现类
 *
 * @author blog
 */
@Slf4j
@Service
public class ArticleViewRecordServiceImpl implements ArticleViewRecordService {

    @Autowired
    private ArticleViewRecordMapper viewRecordMapper;

    @Override
    public boolean checkAndRecordView(Long articleId) {
        Long userId = UserContext.getUserId();
        String ipAddress = IpUtils.getIpAddress();

        // 检查是否已浏览
        if (userId != null) {
            // 登录用户：按用户ID检查
            if (viewRecordMapper.existsByArticleIdAndUserId(articleId, userId)) {
                log.debug("用户{}已浏览过文章{}", userId, articleId);
                return false;
            }
        } else if (ipAddress != null) {
            // 匿名用户：按IP地址检查
            if (viewRecordMapper.existsByArticleIdAndIpAddress(articleId, ipAddress)) {
                log.debug("IP{}已浏览过文章{}", ipAddress, articleId);
                return false;
            }
        }

        // 记录浏览
        ArticleViewRecord record = new ArticleViewRecord();
        record.setArticleId(articleId);
        record.setUserId(userId);
        record.setIpAddress(ipAddress);
        viewRecordMapper.insert(record);

        log.debug("记录新浏览: 文章{}, 用户{}, IP{}", articleId, userId, ipAddress);
        return true;
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanExpiredRecords() {
        LocalDateTime beforeTime = LocalDateTime.now().minusDays(Constants.VIEW_RECORD_RETENTION_DAYS);
        int deleted = viewRecordMapper.deleteByViewTimeBefore(beforeTime);
        log.info("清理过期浏览记录: 删除{}条, 保留{}天内的记录", deleted, Constants.VIEW_RECORD_RETENTION_DAYS);
    }
}