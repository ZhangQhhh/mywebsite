# 评论系统 API 接口文档

## 概述

本文档详细描述了评论系统相关的 API 接口，包括评论的获取、添加、删除、点赞和回复等功能。后端实现基于 SpringBoot 框架，采用 JWT 进行身份验证。

## 基础信息

- 基础 URL: `/api/comments`
- 认证方式: JWT Token (Bearer Authentication)
- 响应格式: JSON
- 错误处理: 统一返回格式，包含 `error_msg` 字段

## 通用响应格式

```json
{
  "error_msg": "success", // 成功为"success"，失败为具体错误信息
  "data": {},             // 返回的数据，成功时包含，失败时可能为null
  "timestamp": 1621234567890 // 时间戳
}
```

## 认证要求

除了获取评论列表接口外，所有 API 请求都需要在 HTTP 头部包含有效的 JWT 令牌：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API 接口详情

### 1. 获取评论列表

获取指定内容（如文章、帖子）的评论列表，支持分页。

#### 请求信息

- URL: `/api/comments/{contentId}`
- 方法: `GET`
- 认证: 可选（未登录用户也可以查看评论）

#### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- | ---- |
| contentId | Path | String/Number | 是 | 内容ID（如文章ID、帖子ID等） |
| pageNum | Query | Number | 否 | 页码，默认为1 |
| pageSize | Query | Number | 否 | 每页数量，默认为10 |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| comments | Array | 评论列表 |
| total | Number | 评论总数 |
| totalPages | Number | 总页数 |
| pageSize | Number | 每页数量 |
| pageNum | Number | 当前页码 |

#### 评论对象结构

| 字段名 | 类型 | 描述 |
| ------ | ---- | ---- |
| id | String/Number | 评论ID |
| userId | String/Number | 用户ID |
| username | String | 用户名 |
| avatar | String | 用户头像URL |
| content | String | 评论内容 |
| time | String/Date | 评论时间 |
| likes | Number | 点赞数 |
| liked | Boolean | 当前用户是否已点赞 |
| parentId | String/Number | 父评论ID（回复评论时使用，顶级评论为null） |
| replyTo | String/Number | 回复的用户ID（回复评论时使用，顶级评论为null） |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "comments": [
    {
      "id": "1",
      "userId": "101",
      "username": "张三",
      "avatar": "https://example.com/avatars/zhangsan.jpg",
      "content": "这篇文章写得很好，学到了很多东西！",
      "time": "2023-04-10T14:30:00Z",
      "likes": 5,
      "liked": true,
      "parentId": null,
      "replyTo": null
    },
    {
      "id": "2",
      "userId": "102",
      "username": "李四",
      "avatar": "https://example.com/avatars/lisi.jpg",
      "content": "我有一个问题，请问如何实现这个功能？",
      "time": "2023-04-10T15:20:00Z",
      "likes": 0,
      "liked": false,
      "parentId": null,
      "replyTo": null
    },
    {
      "id": "3",
      "userId": "101",
      "username": "张三",
      "avatar": "https://example.com/avatars/zhangsan.jpg",
      "content": "@李四 你可以参考文章中的第三部分，那里有详细说明。",
      "time": "2023-04-10T16:05:00Z",
      "likes": 2,
      "liked": false,
      "parentId": "2",
      "replyTo": "102"
    }
  ],
  "total": 3,
  "totalPages": 1,
  "pageSize": 10,
  "pageNum": 1,
  "timestamp": 1621234567890
}
```

### 2. 添加评论

添加一条新评论。

#### 请求信息

- URL: `/api/comments`
- 方法: `POST`
- 认证: 需要JWT令牌
- Content-Type: `application/json`

#### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- | ---- |
| contentId | Body | String/Number | 是 | 内容ID（如文章ID、帖子ID等） |
| content | Body | String | 是 | 评论内容 |
| userId | Body | String/Number | 是 | 用户ID |
| parentId | Body | String/Number | 否 | 父评论ID（回复评论时使用） |
| replyTo | Body | String/Number | 否 | 回复的用户ID（回复评论时使用） |

#### 请求示例

```json
{
  "contentId": "123",
  "content": "这篇文章写得很好，学到了很多东西！",
  "userId": "101"
}
```

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| comment | Object | 新添加的评论对象 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "comment": {
    "id": "4",
    "userId": "101",
    "username": "张三",
    "avatar": "https://example.com/avatars/zhangsan.jpg",
    "content": "这篇文章写得很好，学到了很多东西！",
    "time": "2023-04-11T10:30:00Z",
    "likes": 0,
    "liked": false,
    "parentId": null,
    "replyTo": null
  },
  "timestamp": 1621234567890
}
```

### 3. 删除评论

删除指定ID的评论。

#### 请求信息

- URL: `/api/comments/{commentId}`
- 方法: `DELETE`
- 认证: 需要JWT令牌

#### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- | ---- |
| commentId | Path | String/Number | 是 | 评论ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "timestamp": 1621234567890
}
```

### 4. 点赞/取消点赞评论

对评论进行点赞或取消点赞操作。

#### 请求信息

- URL: `/api/comments/{commentId}/like`
- 方法: `POST`（点赞）或 `DELETE`（取消点赞）
- 认证: 需要JWT令牌

#### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- | ---- |
| commentId | Path | String/Number | 是 | 评论ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| likes | Number | 更新后的点赞数 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "likes": 6,
  "timestamp": 1621234567890
}
```

### 5. 回复评论

回复一条已有的评论。

#### 请求信息

- URL: `/api/comments/reply`
- 方法: `POST`
- 认证: 需要JWT令牌
- Content-Type: `application/json`

#### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- | ---- |
| contentId | Body | String/Number | 是 | 内容ID（如文章ID、帖子ID等） |
| content | Body | String | 是 | 回复内容 |
| userId | Body | String/Number | 是 | 用户ID |
| parentId | Body | String/Number | 是 | 父评论ID |
| replyTo | Body | String/Number | 是 | 回复的用户ID |

#### 请求示例

```json
{
  "contentId": "123",
  "content": "@李四 你可以参考文章中的第三部分，那里有详细说明。",
  "userId": "101",
  "parentId": "2",
  "replyTo": "102"
}
```

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| comment | Object | 新添加的回复评论对象 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "comment": {
    "id": "5",
    "userId": "101",
    "username": "张三",
    "avatar": "https://example.com/avatars/zhangsan.jpg",
    "content": "@李四 你可以参考文章中的第三部分，那里有详细说明。",
    "time": "2023-04-11T11:45:00Z",
    "likes": 0,
    "liked": false,
    "parentId": "2",
    "replyTo": "102"
  },
  "timestamp": 1621234567890
}
```

## 错误码说明

| 错误码 | 描述 |
| ------ | ---- |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token无效） |
| 403 | 权限不足（无权操作） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 安全性考虑

1. **身份验证**：
   - 使用JWT进行身份验证
   - 设置合理的Token过期时间
   - 实现Token刷新机制

2. **权限控制**：
   - 只有评论作者或管理员可以删除评论
   - 用户只能点赞/取消点赞一次

3. **内容安全**：
   - 实现评论内容过滤，防止XSS攻击
   - 限制评论长度和频率，防止垃圾评论

4. **API安全**：
   - 实现请求频率限制
   - 记录敏感操作日志
   - 实现CORS安全配置
