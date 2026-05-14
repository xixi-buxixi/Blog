package com.blog.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 评论返回VO
 *
 * @author blog
 */
@Data
public class CommentVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 评论ID
     */
    private Long id;

    /**
     * 文章ID
     */
    private Long articleId;

    /**
     * 父评论ID(顶级评论为null)
     */
    private Long parentId;

    /**
     * 回复目标评论ID
     */
    private Long replyToId;

    /**
     * 评论者昵称
     */
    private String nickname;

    /**
     * 邮箱(已脱敏)
     */
    private String email;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 状态:1已发布
     */
    private Integer status;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    /**
     * 文章标题(后台管理用)
     */
    private String articleTitle;

    /**
     * 被回复者昵称(仅回复有此字段)
     */
    private String replyToNickname;

    /**
     * 子回复列表(嵌套结构)
     */
    private List<CommentVO> replies;

}
