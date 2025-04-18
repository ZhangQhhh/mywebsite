# 评论系统后端实现指南（上篇：架构设计）

## 1. 概述

本文档是评论系统后端实现的详细指南，主要面向后端开发人员，提供从架构设计到具体实现的全面指导。上篇主要关注系统架构设计、技术选型和基础设施搭建。

## 2. 系统架构

### 2.1 整体架构

评论系统采用经典的三层架构：

```
+-------------------+
|   表现层 (API)    |  处理HTTP请求和响应
+-------------------+
|   业务逻辑层      |  实现业务逻辑
+-------------------+
|   数据访问层      |  与数据库交互
+-------------------+
        |
+-------------------+
|     数据库        |  存储数据
+-------------------+
```

### 2.2 技术栈选择

推荐使用以下技术栈：

- **框架**：Spring Boot 2.7+
- **数据库**：MySQL 8.0+ / PostgreSQL 14+
- **ORM**：MyBatis / Spring Data JPA
- **缓存**：Redis
- **认证**：JWT (JSON Web Token)
- **API文档**：Swagger / SpringDoc OpenAPI
- **构建工具**：Maven / Gradle
- **测试框架**：JUnit 5, Mockito

### 2.3 模块划分

系统分为以下主要模块：

1. **comment-api**：API接口定义和请求/响应模型
2. **comment-service**：业务逻辑实现
3. **comment-dao**：数据访问对象
4. **comment-common**：通用工具和常量
5. **comment-security**：安全相关功能

## 3. 项目结构

推荐的项目结构如下：

```
src/main/java/com/example/comment/
├── api/                    # API层
│   ├── controller/         # 控制器
│   ├── request/            # 请求模型
│   ├── response/           # 响应模型
│   └── advice/             # 全局异常处理
├── service/                # 服务层
│   ├── impl/               # 服务实现
│   └── strategy/           # 策略模式实现
├── dao/                    # 数据访问层
│   ├── entity/             # 实体类
│   ├── mapper/             # MyBatis映射器
│   └── repository/         # 数据库操作接口
├── common/                 # 通用模块
│   ├── constant/           # 常量定义
│   ├── enums/              # 枚举类型
│   ├── exception/          # 自定义异常
│   └── util/               # 工具类
├── security/               # 安全模块
│   ├── config/             # 安全配置
│   ├── filter/             # 安全过滤器
│   └── service/            # 安全服务
└── CommentApplication.java # 应用入口
```

## 4. 数据模型设计

### 4.1 核心实体

根据数据库设计，我们定义以下核心实体：

#### 4.1.1 评论实体 (Comment)

```java
@Data
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "content_id", nullable = false)
    private Long contentId;
    
    @Column(name = "content_type", nullable = false)
    private String contentType;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String content;
    
    @Column(name = "parent_id")
    private Long parentId;
    
    @Column(name = "reply_to_user_id")
    private Long replyToUserId;
    
    @Column(name = "likes_count", nullable = false)
    private Integer likesCount = 0;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### 4.1.2 评论点赞实体 (CommentLike)

```java
@Data
@Entity
@Table(name = "comment_likes")
public class CommentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "comment_id", nullable = false)
    private Long commentId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.2 DTO (数据传输对象)

#### 4.2.1 评论DTO

```java
@Data
public class CommentDTO {
    private Long id;
    private Long contentId;
    private String contentType;
    private Long userId;
    private String username;
    private String avatar;
    private String content;
    private Long parentId;
    private Long replyToUserId;
    private String replyToUsername;
    private Integer likesCount;
    private Boolean liked;
    private LocalDateTime createdAt;
}
```

#### 4.2.2 评论请求DTO

```java
@Data
public class CommentCreateRequest {
    @NotNull(message = "内容ID不能为空")
    private Long contentId;
    
    @NotNull(message = "内容类型不能为空")
    private String contentType;
    
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 1000, message = "评论内容不能超过1000个字符")
    private String content;
    
    private Long parentId;
    
    private Long replyToUserId;
}
```

## 5. 接口设计

### 5.1 RESTful API设计

遵循RESTful API设计原则，我们定义以下接口：

| 方法 | 路径 | 描述 |
| ---- | ---- | ---- |
| GET | /api/comments/{contentId} | 获取指定内容的评论列表 |
| POST | /api/comments | 添加新评论 |
| DELETE | /api/comments/{commentId} | 删除评论 |
| POST | /api/comments/{commentId}/like | 点赞评论 |
| DELETE | /api/comments/{commentId}/like | 取消点赞评论 |
| POST | /api/comments/reply | 回复评论 |

### 5.2 API接口定义

#### 5.2.1 评论控制器

```java
@RestController
@RequestMapping("/api/comments")
@Api(tags = "评论接口")
public class CommentController {
    
    private final CommentService commentService;
    
    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }
    
    @GetMapping("/{contentId}")
    @ApiOperation("获取评论列表")
    public ApiResponse<PageResult<CommentDTO>> getComments(
            @PathVariable Long contentId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        // 实现代码
    }
    
    @PostMapping
    @ApiOperation("添加评论")
    public ApiResponse<CommentDTO> addComment(@RequestBody @Valid CommentCreateRequest request) {
        // 实现代码
    }
    
    @DeleteMapping("/{commentId}")
    @ApiOperation("删除评论")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        // 实现代码
    }
    
    @PostMapping("/{commentId}/like")
    @ApiOperation("点赞评论")
    public ApiResponse<Map<String, Object>> likeComment(@PathVariable Long commentId) {
        // 实现代码
    }
    
    @DeleteMapping("/{commentId}/like")
    @ApiOperation("取消点赞评论")
    public ApiResponse<Map<String, Object>> unlikeComment(@PathVariable Long commentId) {
        // 实现代码
    }
    
    @PostMapping("/reply")
    @ApiOperation("回复评论")
    public ApiResponse<CommentDTO> replyComment(@RequestBody @Valid CommentCreateRequest request) {
        // 实现代码
    }
}
```

## 6. 安全设计

### 6.1 认证方案

采用JWT (JSON Web Token) 进行用户认证：

1. 用户登录成功后，服务器生成JWT令牌并返回给客户端
2. 客户端在后续请求中，在HTTP头部的Authorization字段中携带JWT令牌
3. 服务器验证JWT令牌的有效性，并从中提取用户信息

### 6.2 权限控制

实现基于角色的访问控制 (RBAC)：

1. 普通用户：可以查看评论、发表评论、点赞/取消点赞、回复评论、删除自己的评论
2. 管理员：除了普通用户的权限外，还可以删除任何评论、屏蔽评论

### 6.3 安全配置

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .antMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
            .antMatchers("/api/comments/**").authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
```

## 7. 异常处理

### 7.1 自定义异常

```java
public class CommentException extends RuntimeException {
    private final int code;
    
    public CommentException(String message, int code) {
        super(message);
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}

public class CommentNotFoundException extends CommentException {
    public CommentNotFoundException(String message) {
        super(message, 404);
    }
}

public class UnauthorizedException extends CommentException {
    public UnauthorizedException(String message) {
        super(message, 401);
    }
}

public class ForbiddenException extends CommentException {
    public ForbiddenException(String message) {
        super(message, 403);
    }
}
```

### 7.2 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(CommentException.class)
    public ApiResponse<Void> handleCommentException(CommentException e) {
        return ApiResponse.error(e.getCode(), e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ApiResponse.error(400, message);
    }
    
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception e) {
        return ApiResponse.error(500, "服务器内部错误");
    }
}
```

## 8. 配置管理

### 8.1 应用配置

```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/comment_system?useSSL=false&serverTimezone=UTC
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  redis:
    host: localhost
    port: 6379

jwt:
  secret: your-secret-key
  expiration: 86400000  # 24小时

logging:
  level:
    com.example.comment: DEBUG
```

### 8.2 多环境配置

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/comment_system_dev?useSSL=false&serverTimezone=UTC

# application-test.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/comment_system_test?useSSL=false&serverTimezone=UTC

# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://prod-db-server:3306/comment_system?useSSL=true&serverTimezone=UTC
  jpa:
    show-sql: false
```

## 9. 下一步

在中篇《核心功能实现》中，我们将详细介绍评论系统的核心功能实现，包括：

1. 评论服务的实现
2. 点赞功能的实现
3. 回复功能的实现
4. 数据访问层的实现
5. 缓存策略的实现
