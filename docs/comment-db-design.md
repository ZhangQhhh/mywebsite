# 评论系统数据库设计文档

## 概述

本文档详细描述了评论系统的数据库设计，包括表结构、字段说明、索引设计和关系模型。数据库设计基于关系型数据库（MySQL/PostgreSQL），支持评论的基本功能，包括评论发布、回复、点赞等。

## 数据库表设计

评论系统主要包含以下几个表：

1. `comments` - 评论表，存储评论的基本信息
2. `comment_likes` - 评论点赞表，记录用户对评论的点赞状态
3. `comment_reports` - 评论举报表（可选），记录用户对评论的举报信息

### 1. 评论表（comments）

存储所有评论的基本信息，包括评论内容、作者、时间等。

#### 表结构

| 字段名 | 数据类型 | 约束 | 描述 |
| ------ | -------- | ---- | ---- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 评论ID，主键 |
| content_id | BIGINT | NOT NULL | 内容ID（如文章ID、帖子ID等） |
| content_type | VARCHAR(50) | NOT NULL | 内容类型（如'post'、'article'等） |
| user_id | BIGINT | NOT NULL | 评论作者ID |
| content | TEXT | NOT NULL | 评论内容 |
| parent_id | BIGINT | NULL | 父评论ID，用于回复功能，顶级评论为NULL |
| reply_to_user_id | BIGINT | NULL | 回复的用户ID，用于回复功能，顶级评论为NULL |
| likes_count | INT | NOT NULL, DEFAULT 0 | 点赞数量 |
| status | TINYINT | NOT NULL, DEFAULT 1 | 评论状态：1-正常，0-已删除，2-已屏蔽 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 索引设计

| 索引名 | 类型 | 字段 | 描述 |
| ------ | ---- | ---- | ---- |
| PRIMARY | PRIMARY KEY | id | 主键索引 |
| idx_content | INDEX | content_id, content_type | 内容索引，用于快速查询特定内容的评论 |
| idx_user | INDEX | user_id | 用户索引，用于快速查询用户的评论 |
| idx_parent | INDEX | parent_id | 父评论索引，用于快速查询回复 |
| idx_created | INDEX | created_at | 创建时间索引，用于按时间排序 |

#### 创建SQL语句

```sql
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT NULL,
    reply_to_user_id BIGINT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content (content_id, content_type),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 评论点赞表（comment_likes）

记录用户对评论的点赞状态，用于实现点赞/取消点赞功能和防止重复点赞。

#### 表结构

| 字段名 | 数据类型 | 约束 | 描述 |
| ------ | -------- | ---- | ---- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 点赞记录ID，主键 |
| comment_id | BIGINT | NOT NULL | 评论ID |
| user_id | BIGINT | NOT NULL | 用户ID |
| status | TINYINT | NOT NULL, DEFAULT 1 | 点赞状态：1-已点赞，0-已取消 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 索引设计

| 索引名 | 类型 | 字段 | 描述 |
| ------ | ---- | ---- | ---- |
| PRIMARY | PRIMARY KEY | id | 主键索引 |
| idx_comment_user | UNIQUE INDEX | comment_id, user_id | 评论用户联合唯一索引，防止重复点赞 |
| idx_user | INDEX | user_id | 用户索引，用于快速查询用户的点赞记录 |

#### 创建SQL语句

```sql
CREATE TABLE comment_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_comment_user (comment_id, user_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 评论举报表（comment_reports）（可选）

记录用户对评论的举报信息，用于实现评论举报功能和内容审核。

#### 表结构

| 字段名 | 数据类型 | 约束 | 描述 |
| ------ | -------- | ---- | ---- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 举报记录ID，主键 |
| comment_id | BIGINT | NOT NULL | 评论ID |
| user_id | BIGINT | NOT NULL | 举报用户ID |
| reason | VARCHAR(255) | NOT NULL | 举报原因 |
| status | TINYINT | NOT NULL, DEFAULT 0 | 处理状态：0-未处理，1-已处理，2-已忽略 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 索引设计

| 索引名 | 类型 | 字段 | 描述 |
| ------ | ---- | ---- | ---- |
| PRIMARY | PRIMARY KEY | id | 主键索引 |
| idx_comment | INDEX | comment_id | 评论索引，用于快速查询评论的举报记录 |
| idx_user | INDEX | user_id | 用户索引，用于快速查询用户的举报记录 |
| idx_status | INDEX | status | 状态索引，用于快速查询未处理的举报 |

#### 创建SQL语句

```sql
CREATE TABLE comment_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comment (comment_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 数据库关系模型

### 实体关系图

```
+-------------+       +---------------+       +----------------+
|   users     |       |   comments    |       |  content_items |
+-------------+       +---------------+       +----------------+
| id          |<----->| user_id       |       | id             |
| username    |       | content_id    |<----->| type           |
| ...         |       | content_type  |       | ...            |
+-------------+       | parent_id     |       +----------------+
      ^               | ...           |
      |               +---------------+
      |                      ^
      |                      |
      |               +---------------+
      |               | comment_likes |
      +-------------->| user_id       |
                      | comment_id    |
                      | ...           |
                      +---------------+
```

### 关系说明

1. **用户与评论**：一对多关系，一个用户可以发表多条评论
2. **内容与评论**：一对多关系，一个内容项（如文章、帖子）可以有多条评论
3. **评论与回复**：自引用关系，一条评论可以有多条回复（通过parent_id关联）
4. **用户与点赞**：一对多关系，一个用户可以点赞多条评论
5. **评论与点赞**：一对多关系，一条评论可以被多个用户点赞

## 数据库优化建议

1. **分表策略**：
   - 当评论数量非常大时，可以考虑按内容ID或时间范围分表
   - 例如：`comments_202301`、`comments_202302` 等按月份分表

2. **缓存策略**：
   - 热门内容的评论可以缓存在Redis中
   - 评论计数（如点赞数）可以缓存并定期同步到数据库

3. **索引优化**：
   - 根据实际查询模式调整索引
   - 考虑添加复合索引以优化常见查询

4. **存储优化**：
   - 对于评论内容，可以考虑压缩存储
   - 对于已删除的评论，可以考虑定期物理删除或归档

## 数据库维护建议

1. **定期清理**：
   - 定期清理已删除的评论和点赞记录
   - 定期归档旧评论到历史表

2. **监控与告警**：
   - 监控评论表的增长速度
   - 监控查询性能，特别是热门内容的评论查询

3. **备份策略**：
   - 实施定期备份
   - 考虑增量备份以减少备份时间和存储空间

4. **安全措施**：
   - 实施数据库访问控制
   - 对敏感操作进行审计日志记录
