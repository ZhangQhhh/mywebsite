# 帖子系统API接口文档

本文档详细说明了帖子系统的API接口，包括请求URL、请求方法、参数说明和返回值格式，供后端开发人员参考实现。

## 基础URL

- 帖子相关API的基础URL: `http://localhost:3000/api/posts`
- 分类相关API的基础URL: `http://localhost:3000/posts/addPostPage/`

## 帖子相关接口

### 1. 获取帖子列表

获取帖子列表，支持分页和分类筛选。

- **URL**: `${POST_API_URL}/list`
- **方法**: GET
- **参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | page | Number | 否 | 页码，默认为1 |
  | limit | Number | 否 | 每页数量，默认为10 |
  | category | String | 否 | 分类ID |
  | keyword | String | 否 | 搜索关键词 |

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "posts": [
        {
          "id": "1",
          "title": "帖子标题",
          "content": "帖子内容",
          "category": "technology",
          "createdAt": "2023-05-01T12:00:00.000Z",
          "likes": 10,
          "author": {
            "id": "1",
            "username": "user1"
          }
        }
      ]
    }
  }
  ```

### 2. 获取帖子详情

根据ID获取帖子详情。

- **URL**: `${POST_API_URL}/:id`
- **方法**: GET
- **参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | id | String | 是 | 帖子ID |

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "id": "1",
      "title": "帖子标题",
      "content": "帖子内容",
      "category": "technology",
      "createdAt": "2023-05-01T12:00:00.000Z",
      "likes": 10,
      "author": {
        "id": "1",
        "username": "user1"
      },
      "comments": [
        {
          "id": "1",
          "content": "评论内容",
          "createdAt": "2023-05-01T13:00:00.000Z",
          "author": {
            "id": "2",
            "username": "user2"
          }
        }
      ]
    }
  }
  ```

### 3. 创建新帖子

创建一个新的帖子。

- **URL**: `${POST_API_URL}`
- **方法**: POST
- **请求头**:
  ```
  Content-Type: application/json
  ```
- **请求体**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | title | String | 是 | 帖子标题 |
  | content | String | 是 | 帖子内容 |
  | category | String | 是 | 分类ID |
  | createdAt | String | 是 | 创建时间，ISO格式 |

- **请求示例**:
  ```json
  {
    "title": "帖子标题",
    "content": "帖子内容",
    "category": "technology",
    "createdAt": "2023-05-01T12:00:00.000Z"
  }
  ```

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "id": "1",
      "title": "帖子标题",
      "content": "帖子内容",
      "category": "technology",
      "createdAt": "2023-05-01T12:00:00.000Z",
      "likes": 0,
      "author": {
        "id": "1",
        "username": "user1"
      }
    }
  }
  ```

### 4. 更新帖子

更新已有帖子的内容。

- **URL**: `${POST_API_URL}/:id`
- **方法**: PUT
- **请求头**:
  ```
  Content-Type: application/json
  ```
- **参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | id | String | 是 | 帖子ID |

- **请求体**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | title | String | 否 | 帖子标题 |
  | content | String | 否 | 帖子内容 |
  | category | String | 否 | 分类ID |

- **请求示例**:
  ```json
  {
    "title": "更新后的标题",
    "content": "更新后的内容",
    "category": "life"
  }
  ```

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "id": "1",
      "title": "更新后的标题",
      "content": "更新后的内容",
      "category": "life",
      "createdAt": "2023-05-01T12:00:00.000Z",
      "updatedAt": "2023-05-02T12:00:00.000Z",
      "likes": 10,
      "author": {
        "id": "1",
        "username": "user1"
      }
    }
  }
  ```

### 5. 删除帖子

删除指定ID的帖子。

- **URL**: `${POST_API_URL}/:id`
- **方法**: DELETE
- **参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | id | String | 是 | 帖子ID |

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": null
  }
  ```

### 6. 点赞帖子

对指定ID的帖子进行点赞。

- **URL**: `${POST_API_URL}/:id/like`
- **方法**: POST
- **参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | ----- | ---- | ---- | ---- |
  | id | String | 是 | 帖子ID |

- **返回示例**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "likes": 11
    }
  }
  ```

## 分类相关接口

### 1. 获取所有分类

获取所有可用的帖子分类。

- **URL**: `${CATEGORY_API_URL}`
- **方法**: GET
- **返回示例**:
  ```json
  [
    { "id": "technology", "name": "技术" },
    { "id": "life", "name": "生活" },
    { "id": "study", "name": "学习" },
    { "id": "other", "name": "其他" }
  ]
  ```

## 错误码说明

| 错误码 | 描述 |
| ----- | ---- |
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有请求应当在请求头中包含用户认证信息（如JWT令牌）
2. 创建和更新帖子时，请确保内容符合社区规范
3. 服务器返回的时间均为ISO格式
4. 分页参数中，页码从1开始计数