package com.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 评论实体类
 *
 * @author blog
 */
@Data
@TableName("t_comment")
public class Comment implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 文章ID
     */
    @TableField("article_id")
    private Long articleId;

    /**
     * 父评论ID(顶级评论为NULL)
     */
    @TableField("parent_id")
    private Long parentId;

    /**
     * 回复目标评论ID
     */
    @TableField("reply_to_id")
    private Long replyToId;

    /**
     * 评论者昵称
     */
    @TableField("nickname")
    private String nickname;

    /**
     * 评论者邮箱
     */
    @TableField("email")
    private String email;

    /**
     * 评论内容
     */
    @TableField("content")
    private String content;

    /**
     * 状态:0待审核/1已发布/2已删除
     */
    @TableField("status")
    private Integer status;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 逻辑删除标记:0未删除/1已删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

}