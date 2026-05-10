package com.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 文章浏览记录实体类
 *
 * @author blog
 */
@Data
@TableName("t_article_view_record")
public class ArticleViewRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("article_id")
    private Long articleId;

    @TableField("user_id")
    private Long userId;

    @TableField("ip_address")
    private String ipAddress;

    @TableField(value = "view_time", fill = FieldFill.INSERT)
    private LocalDateTime viewTime;
}