# 用户资料管理API文档

## 概述

本文档详细描述了用户资料管理相关的API接口，包括密码修改、头像更新和用户帖子管理等功能。后端实现基于SpringBoot框架，采用JWT进行身份验证，并使用七牛云OSS进行文件存储。

## 基础信息

- 基础URL: `http://your-api-domain/api`
- 认证方式: JWT Token (Bearer Authentication)
- 响应格式: JSON
- 错误处理: 统一返回格式，包含错误码和错误信息

## 通用响应格式

```json
{
  "error_msg": "success", // 成功为"success"，失败为具体错误信息
  "data": {}, // 返回的数据，成功时包含，失败时可能为null
  "timestamp": 1621234567890 // 时间戳
}
```

## 认证要求

除了登录和注册接口外，所有API请求都需要在HTTP头部包含有效的JWT令牌：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API接口详情

### 1. 修改用户密码

#### 请求信息

- URL: `/user/updatePassword`
- 方法: `POST`
- 认证: 需要JWT令牌

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| userId | String | 是 | 用户ID |
| currentPassword | String | 是 | 当前密码 |
| newPassword | String | 是 | 新密码 |

#### 请求示例

```json
{
  "userId": "12345",
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

#### 响应参数

| 参数名 | 类型 | 描述 |
| --- | --- | --- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| user | Object | 更新后的用户信息（可选） |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "timestamp": 1621234567890
}
```

#### 响应示例（失败）

```json
{
  "error_msg": "当前密码不正确",
  "timestamp": 1621234567890
}
```

#### 可能的错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 请求参数错误 |
| 401 | 未授权或当前密码错误 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

### 2. 更新用户头像

#### 请求信息

- URL: `/user/updateAvatar`
- 方法: `POST`
- 认证: 需要JWT令牌
- 内容类型: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| userId | String | 是 | 用户ID |
| avatar | File | 是 | 头像文件，支持JPG、PNG格式，大小不超过2MB |

#### 响应参数

| 参数名 | 类型 | 描述 |
| --- | --- | --- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| user | Object | 更新后的用户信息，包含新头像URL |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "user": {
    "id": "12345",
    "photo": "http://cdn.example.com/avatars/user_12345.jpg",
    "username": "example_user"
  },
  "timestamp": 1621234567890
}
```

#### 响应示例（失败）

```json
{
  "error_msg": "文件大小超过限制",
  "timestamp": 1621234567890
}
```

#### 可能的错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 请求参数错误或文件格式不支持 |
| 401 | 未授权 |
| 404 | 用户不存在 |
| 413 | 文件大小超过限制 |
| 500 | 服务器内部错误 |

### 3. 获取用户帖子列表

#### 请求信息

- URL: `/user/posts/detail/list/{userId}`
- 方法: `GET`
- 认证: 需要JWT令牌

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| userId | String | 是 | 用户ID（路径参数） |
| pageNum | Integer | 否 | 页码，默认为1 |
| pageSize | Integer | 否 | 每页记录数，默认为5 |

#### 响应参数

| 参数名 | 类型 | 描述 |
| --- | --- | --- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |
| posts | Array | 帖子列表 |
| total_posts | Integer | 帖子总数 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "posts": [
    {
      "postId": "1001",
      "postTitle": "示例帖子标题",
      "createTime": "2023-05-20T10:30:00",
      "postViews": 120
    },
    {
      "postId": "1002",
      "postTitle": "另一个帖子标题",
      "createTime": "2023-05-18T14:20:00",
      "postViews": 85
    }
  ],
  "total_posts": 12,
  "timestamp": 1621234567890
}
```

#### 响应示例（失败）

```json
{
  "error_msg": "获取用户帖子列表失败",
  "timestamp": 1621234567890
}
```

#### 可能的错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

### 4. 删除用户帖子

#### 请求信息

- URL: `/user/posts/delete`
- 方法: `POST`
- 认证: 需要JWT令牌

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| postId | String | 是 | 帖子ID |
| userId | String | 是 | 用户ID |

#### 请求示例

```json
{
  "postId": "1001",
  "userId": "12345"
}
```

#### 响应参数

| 参数名 | 类型 | 描述 |
| --- | --- | --- |
| error_msg | String | 响应状态，成功为"success"，失败为错误信息 |

#### 响应示例（成功）

```json
{
  "error_msg": "success",
  "timestamp": 1621234567890
}
```

#### 响应示例（失败）

```json
{
  "error_msg": "删除帖子失败，权限不足",
  "timestamp": 1621234567890
}
```

#### 可能的错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足（非帖子作者） |
| 404 | 帖子或用户不存在 |
| 500 | 服务器内部错误 |

## 后端实现建议

### SpringBoot实现

1. **项目结构**

```
src/main/java/com/example/website
├── config
│   ├── SecurityConfig.java        // 安全配置
│   ├── JwtConfig.java             // JWT配置
│   └── QiniuConfig.java           // 七牛云配置
├── controller
│   └── UserProfileController.java // 用户资料控制器
├── service
│   ├── UserService.java           // 用户服务接口
│   ├── UserServiceImpl.java       // 用户服务实现
│   ├── PostService.java           // 帖子服务接口
│   └── PostServiceImpl.java       // 帖子服务实现
├── repository
│   ├── UserRepository.java        // 用户数据访问
│   └── PostRepository.java        // 帖子数据访问
├── model
│   ├── User.java                  // 用户实体
│   └── Post.java                  // 帖子实体
├── dto
│   ├── PasswordUpdateDTO.java     // 密码更新数据传输对象
│   └── ApiResponse.java           // API响应封装
└── util
    ├── JwtUtil.java               // JWT工具类
    └── QiniuUtil.java             // 七牛云工具类
```

2. **JWT认证实现**

```java
// JwtUtil.java
public String generateToken(String username) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);
    
    return Jwts.builder()
        .setSubject(username)
        .setIssuedAt(now)
        .setExpiration(expiryDate)
        .signWith(SignatureAlgorithm.HS512, jwtSecret)
        .compact();
}

public boolean validateToken(String token) {
    try {
        Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
        return true;
    } catch (Exception ex) {
        return false;
    }
}
```

3. **七牛云OSS集成**

```java
// QiniuUtil.java
public String uploadFile(MultipartFile file, String key) throws IOException {
    // 获取上传凭证
    Auth auth = Auth.create(accessKey, secretKey);
    String upToken = auth.uploadToken(bucket);
    
    // 上传文件
    Response response = new UploadManager().put(
        file.getBytes(), key, upToken);
    
    // 返回文件访问URL
    return domain + "/" + key;
}
```

### 七牛云OSS集成建议

1. **配置七牛云参数**

```properties
# application.properties
qiniu.access-key=your_access_key
qiniu.secret-key=your_secret_key
qiniu.bucket=your_bucket_name
qiniu.domain=your_bucket_domain
```

2. **头像上传处理流程**

- 验证文件类型和大小
- 生成唯一文件名（可使用用户ID和时间戳组合）
- 上传到七牛云存储
- 保存返回的URL到用户记录
- 返回更新后的用户信息

3. **安全性考虑**

- 使用私有空间存储敏感文件
- 为上传的文件设置合适的Content-Type
- 实现防盗链措施
- 定期更换密钥

## 数据库设计建议

### 用户表 (users)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | BIGINT | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(100) | 密码（加密存储） |
| email | VARCHAR(100) | 邮箱，唯一 |
| photo | VARCHAR(255) | 头像URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 帖子表 (posts)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| post_id | BIGINT | 主键，自增 |
| user_id | BIGINT | 外键，关联用户表 |
| post_title | VARCHAR(200) | 帖子标题 |
| post_content | TEXT | 帖子内容 |
| post_views | INT | 浏览次数 |
| create_time | TIMESTAMP | 创建时间 |
| update_time | TIMESTAMP | 更新时间 |

## 安全性建议

1. **密码处理**
   - 使用BCrypt等强哈希算法存储密码
   - 实现密码强度验证
   - 限制密码修改频率

2. **JWT安全**
   - 设置合理的Token过期时间
   - 实现Token刷新机制
   - 在敏感操作时要求重新验证

3. **文件上传安全**
   - 严格验证文件类型和大小
   - 使用随机文件名存储
   - 实现文件内容检测

4. **API安全**
   - 实现请求频率限制
   - 记录敏感操作日志
   - 实现CORS安全配置

## 错误处理建议

实现全局异常处理器，统一处理各类异常并返回标准格式的错误响应：

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {
        ApiResponse response = new ApiResponse("服务器内部错误", null);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorizedException(UnauthorizedException ex) {
        ApiResponse response = new ApiResponse(ex.getMessage(), null);
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
    
    // 其他异常处理方法...
}
```

## 测试建议

1. 单元测试各服务层方法
2. 集成测试API端点
3. 模拟各种错误情况的测试用例
4. 性能测试，特别是文件上传功能

## 部署建议

1. 使用Docker容器化应用
2. 配置HTTPS
3. 实现健康检查端点
4. 设置适当的日志级别和轮转策略
5. 配置数据库连接池

---

本文档仅供参考，实际实现可能需要根据具体需求进行调整。如有任何问题，请联系开发团队。