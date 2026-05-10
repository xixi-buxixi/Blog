# 博客评论功能后端实现总结

## 实现概述

根据需求文档和API文档,成功实现了博客评论功能的后端部分,包括完整的CRUD操作、嵌套回复、权限控制和安全防护。

## 创建的文件清单

### 1. Entity层 (PO)
- `Comment.java` - 评论实体类
  - 包含所有数据库字段映射
  - 使用MyBatis-Plus注解(@TableName, @TableId, @TableField, @TableLogic)
  - 使用Lombok注解(@Data)

### 2. Mapper层
- `CommentMapper.java` - Mapper接口
  - 继承BaseMapper<Comment>
  - 定义5个自定义查询方法:
    - selectTopCommentsByArticleId - 分页查询顶级评论
    - selectRepliesByParentId - 查询子回复
    - countCommentsByArticleId - 统计总评论数
    - countTopCommentsByArticleId - 统计顶级评论数
    - selectCommentById - 查询评论详情
    - deleteByParentId - 批量删除子评论
- `CommentMapper.xml` - MyBatis XML映射
  - 实现复杂的嵌套查询SQL
  - LEFT JOIN用户表获取用户信息
  - LEFT JOIN评论表获取被回复者昵称

### 3. DTO层
- `CommentDTO.java` - 发表评论请求DTO
  - 包含所有评论字段(articleId, parentId, replyToId, nickname, email, content)
  - 添加验证注解(@NotNull, @NotBlank, @Size, @Email)

### 4. VO层
- `CommentVO.java` - 评论返回VO
  - 包含所有评论字段和嵌套replies列表
  - 添加isOwner字段标识当前用户是否为评论作者
  - 添加replyToNickname字段标识被回复者昵称
  - 添加userNickname和userAvatar字段关联用户信息
  - 使用@JsonFormat格式化时间字段

### 5. Service层
- `CommentService.java` - 服务接口
  - 定义4个核心方法:
    - getCommentsByArticleId - 获取评论列表(分页,带嵌套回复)
    - getCommentCount - 获取评论数量
    - createComment - 发表评论
    - deleteComment - 删除评论
- `CommentServiceImpl.java` - 服务实现
  - 实现完整的业务逻辑:
    - 评论层级校验(最多2层嵌套)
    - 游客评论和登录用户评论处理
    - XSS防护(过滤HTML标签)
    - 邮箱脱敏(隐藏中间字符)
    - 删除权限校验(仅作者或管理员)
    - 递归填充嵌套回复

### 6. Controller层
- `CommentController.java` - 控制器
  - 实现4个REST API接口:
    - GET /api/v1/comments/article/{articleId} - 获取评论列表
    - GET /api/v1/comments/article/{articleId}/count - 获取评论数量
    - POST /api/v1/comments - 发表评论
    - DELETE /api/v1/comments/{id} - 删除评论
  - 使用Swagger注解(@Tag, @Operation, @Parameter)

### 7. Constants更新
- 在`Constants.java`中添加评论相关常量:
  - COMMENT_STATUS_PENDING = 0 (待审核)
  - COMMENT_STATUS_PUBLISHED = 1 (已发布)
  - COMMENT_STATUS_DELETED = 2 (已删除)
  - COMMENT_CONTENT_MAX_LENGTH = 500
  - COMMENT_NICKNAME_MIN_LENGTH = 2
  - COMMENT_NICKNAME_MAX_LENGTH = 50

### 8. 公开API配置更新
- 更新`JwtInterceptor.java`:
  - 添加评论查询接口到公开GET路径
  - 支持游客访问评论列表和评论数量接口

## 核心业务逻辑实现

### 1. 评论层级校验
```java
// 顶级评论
if (parentId == null && replyToId == null) {
    // 直接评论文章
}

// 一级回复
if (parentComment.getParentId() == null && replyToId.equals(parentId)) {
    // 回复顶级评论
}

// 二级回复
if (replyToComment.getParentId().equals(parentId) && 
    replyToComment.getReplyToId().equals(parentId)) {
    // 回复一级回复,不能继续嵌套
}

// 校验不能回复二级评论
if (replyToComment.getReplyToId() != null && 
    !replyToComment.getReplyToId().equals(parentId)) {
    throw new BusinessException("不能回复该评论,已达到最大层级");
}
```

### 2. 游客评论处理
```java
if (userId == null) {
    // 游客评论:必须填写昵称和邮箱
    nickname = sanitizeInput(commentDTO.getNickname());
    email = commentDTO.getEmail();
} else {
    // 登录用户评论:使用用户信息
    User user = userMapper.selectById(userId);
    nickname = user.getNickname();
    email = null;
}
```

### 3. XSS防护
```java
private String sanitizeInput(String input) {
    // 移除HTML标签
    String sanitized = HTML_TAG_PATTERN.matcher(input).replaceAll("");
    // 移除特殊字符
    sanitized = sanitized.replaceAll("[<>\"'&]", "");
    return sanitized.trim();
}
```

### 4. 邮箱脱敏
```java
private String maskEmail(String email) {
    // test@example.com -> t***@example.com
    return EMAIL_MASK_PATTERN.matcher(email).replaceAll("***");
}
```

### 5. 删除权限校验
```java
boolean isOwner = commentVO.getUserId().equals(currentUserId);
boolean isAdmin = Constants.ROLE_ADMIN.equals(currentUser.getRole());
if (!isOwner && !isAdmin) {
    throw new BusinessException(403, "无权删除该评论");
}

// 删除顶级评论时,同时删除所有子评论
if (commentVO.getParentId() == null) {
    commentMapper.deleteByParentId(id);
}
```

### 6. 嵌套回复递归填充
```java
private void fillCommentDetails(CommentVO comment, Long currentUserId) {
    // 设置isOwner标识
    comment.setIsOwner(comment.getUserId().equals(currentUserId));
    
    // 邮箱脱敏
    if (StrUtil.isNotBlank(comment.getEmail())) {
        comment.setEmail(maskEmail(comment.getEmail()));
    }
    
    // 查询子回复并递归填充
    List<CommentVO> replies = commentMapper.selectRepliesByParentId(comment.getId());
    for (CommentVO reply : replies) {
        fillCommentDetails(reply, currentUserId);
    }
    comment.setReplies(replies);
}
```

## 技术要点总结

### 1. MyBatis-Plus注解使用
- @TableName("t_comment") - 指定表名
- @TableId(type = IdType.AUTO) - 自增主键
- @TableField(value = "create_time", fill = FieldFill.INSERT) - 自动填充
- @TableLogic - 逻辑删除标记

### 2. 验证注解使用
- @NotNull - 不能为null
- @NotBlank - 不能为空字符串
- @Size(min=2, max=50) - 长度范围
- @Email - 邮箱格式校验

### 3. 异常处理规范
- BusinessException构造函数: (Integer code, String message)
- 业务异常code: 400(参数错误), 401(未授权), 403(禁止访问), 404(不存在)

### 4. 公开API配置
- JwtInterceptor的PUBLIC_GET_PATHS集合添加评论查询路径
- isPublicGetPath方法添加正则匹配规则

### 5. 时间格式化
- @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")

## 编译验证结果

所有代码编译通过,无语法错误和遗漏导入。

## 后续建议

1. 建议执行数据库迁移脚本创建评论表
2. 建议编写单元测试验证业务逻辑
3. 建议添加IP限制防止垃圾评论
4. 建议完善审核机制(当前默认直接发布)
5. 建议添加评论编辑功能

## 注意事项

1. BusinessException构造函数参数顺序必须是: (Integer code, String message)
2. XSS过滤不能使用Hutool的CharSequenceUtil.clean方法(不存在),应使用正则表达式
3. 邮箱脱敏正则表达式: (?<=.{1}).(?=.*@)
4. 评论层级校验逻辑较为复杂,需仔细理解parent_id和reply_to_id的关系
5. 删除顶级评论时需同时删除所有子评论(批量逻辑删除)

## 完成时间

2026-04-10

## 实现状态

已完成所有后端代码实现,编译验证通过,符合项目规范和需求文档。