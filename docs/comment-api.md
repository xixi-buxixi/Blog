# 博客评论功能接口文档

## 基础信息

- **Base URL**: `/api/v1/comments`
- **认证方式**: 无需认证（所有接口公开）
- **响应格式**: JSON

---

## 1. 获取文章评论列表（公开API）

### 请求

```
GET /api/v1/comments/article/{articleId}
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | 是 | 文章ID（路径参数） |
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认20 |

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "articleId": 10,
        "parentId": null,
        "replyToId": null,
        "nickname": "游客小明",
        "email": "t***@example.com",
        "content": "这篇文章写得很好！",
        "status": 1,
        "createTime": "2026-04-10 18:00:00",
        "replyToNickname": null,
        "replies": [
          {
            "id": 2,
            "articleId": 10,
            "parentId": 1,
            "replyToId": 1,
            "nickname": "游客小红",
            "email": "x***@example.com",
            "content": "同感！",
            "status": 1,
            "createTime": "2026-04-10 18:05:00",
            "replyToNickname": "游客小明",
            "replies": []
          }
        ]
      }
    ],
    "total": 50,
    "current": 1,
    "size": 20,
    "pages": 3
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 评论ID |
| articleId | Long | 文章ID |
| parentId | Long | 父评论ID（顶级评论为null） |
| replyToId | Long | 回复目标评论ID |
| nickname | String | 评论者昵称 |
| email | String | 邮箱（脱敏显示） |
| content | String | 评论内容 |
| status | Integer | 状态：1已发布 |
| createTime | String | 创建时间 |
| replyToNickname | String | 被回复者昵称（仅回复有此字段） |
| replies | Array | 子回复列表 |

---

## 2. 发表评论（公开API）

### 请求

```
POST /api/v1/comments
```

### 请求体

```json
{
  "articleId": 10,
  "parentId": null,
  "replyToId": null,
  "nickname": "游客小明",
  "email": "test@example.com",
  "content": "这篇文章写得很好！"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | 是 | 文章ID |
| parentId | Long | 否 | 父评论ID（回复时填写顶级评论ID） |
| replyToId | Long | 否 | 回复目标评论ID（回复时填写） |
| nickname | String | 是 | 昵称，2-50字符 |
| email | String | 是 | 邮箱地址 |
| content | String | 是 | 评论内容，1-500字符 |

### 业务规则

1. **顶级评论**：`parentId` 和 `replyToId` 都为 null
2. **一级回复**：`parentId` = 顶级评论ID，`replyToId` = 顶级评论ID
3. **二级回复**：`parentId` = 顶级评论ID，`replyToId` = 一级回复ID
4. 不能回复二级评论（已是最深层级）

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "articleId": 10,
    "nickname": "游客小明",
    "content": "这篇文章写得很好！",
    "createTime": "2026-04-10 18:00:00"
  }
}
```

### 错误响应

| code | message | 场景 |
|------|---------|------|
| 400 | 文章不存在 | articleId 无效 |
| 400 | 评论内容不能为空 | content 为空 |
| 400 | 评论内容过长 | content 超过500字符 |
| 400 | 昵称格式不正确 | 昵称长度不符 |
| 400 | 邮箱格式不正确 | 邮箱格式无效 |
| 400 | 不能回复该评论 | 回复层级已满 |

---

## 3. 获取评论统计（公开API）

### 请求

```
GET /api/v1/comments/article/{articleId}/count
```

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50
  }
}
```

---

## 4. 删除评论（管理API - 需认证）

### 请求

```
DELETE /api/v1/comments/{id}
```

### 认证

需携带JWT Token（仅后台管理调用）

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 评论ID（路径参数） |

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 错误响应

| code | message | 场景 |
|------|---------|------|
| 401 | 未授权，请先登录 | 未携带Token |
| 404 | 评论不存在 | id 无效 |

---

## 5. 获取所有评论列表（管理API - 需认证）

### 请求

```
GET /api/v1/comments/manage
```

### 认证

需携带JWT Token（仅后台管理调用）

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| size | Integer | 否 | 每页数量，默认10 |
| articleId | Long | 否 | 按文章ID筛选 |

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "articleId": 10,
        "articleTitle": "文章标题",
        "parentId": null,
        "nickname": "游客小明",
        "email": "test@example.com",
        "content": "评论内容",
        "status": 1,
        "createTime": "2026-04-10 18:00:00"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 10,
    "pages": 10
  }
}
```

---

## 错误码汇总

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |