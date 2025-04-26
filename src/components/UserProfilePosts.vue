<template>
<div class="card">
    <div class="card-body">
        <h3 class="section-title">
            <i class="bi bi-file-earmark-text"></i> 帖子列表
        </h3>

        <!-- 分类按钮组 -->
        <div class="category-buttons">
            <button 
                v-for="category in categories" 
                :key="category.id"
                class="btn category-btn"
                :class="[
                    selectedCategory === category.id 
                        ? 'btn-primary' 
                        : 'btn-outline-primary'
                ]"
                @click="changeCategory(category.id)"
            >
                {{ category.name }}
                <span class="badge bg-light text-primary ms-2">
                    {{ 
                        category.id === 'all' 
                            ? posts.length 
                            : posts.filter(p => p.postCategoryName === category.id).length 
                    }}
                </span>
            </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>正在加载帖子...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>{{ errorMessage }}</p>
        </div>

        <!-- 没有帖子 -->
        <div v-else-if="filteredPosts.length === 0" class="empty-posts">
            <i class="bi bi-file-earmark-x"></i>
            <p>当前分类暂无帖子</p>
        </div>

        <!-- 帖子列表 -->
        <div v-else class="posts-list">
            <div v-for="post in filteredPosts" :key="post.postId" class="post-card" @click="goToPostDetail(post.postId)">
                <div class="post-header">
                    <h4 class="post-title">{{ post.postTitle }}</h4>
                    <span class="post-category">{{ post.postCategoryName }}</span>
                </div>
                <p class="post-preview">{{ getContentPreview(post.postContent) }}</p>
                <div class="post-footer">
                    <span class="post-time"><i class="bi bi-clock"></i> {{ formatDate(post.createTime) }}</span>
                    <div class="post-stats">
                        <span class="post-stat"><i class="bi bi-eye"></i> {{ post.postViews || 0 }}</span>
                        <span class="post-stat"><i class="bi bi-hand-thumbs-up"></i> {{ post.postLikes || 0 }}</span>
                        <span class="post-stat"><i class="bi bi-bookmark"></i> {{ post.postCollects || 0 }}</span>
                        <span class="post-stat"><i class="bi bi-person"></i> {{ userNames[post.publishUserId] || '加载中...' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination-container">
            <button 
                class="btn page-btn" 
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
            </button>
            
            <button 
                v-for="page in displayedPages" 
                :key="page" 
                class="btn page-btn" 
                :class="{ active: currentPage === page }"
                @click="changePage(page)">
                {{ page }}
            </button>
            
            <button 
                class="btn page-btn" 
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router';
import { ref, watch, computed } from 'vue';
import { API_BASE_URL } from '@/config/api';
export default{
    name:'UserProfilePosts',
    props: {
        posts:{
            type: Array,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: Boolean,
            default: false
        },
        errorMessage: {
            type: String,
            default: ''
        },
        currentPage: {
            type: Number,
            default: 1
        },
        totalPages: {
            type: Number,
            default: 1
        },
        displayedPages: {
            type: Array,
            default: () => []
        }
    },
    emits: ['change-page'],
    setup(props, { emit }){
        const userNames = ref({});
        const router = useRouter();
        const selectedCategory = ref('all'); // 当前选中的分类
        const categories = ref([
            { id: 'all', name: '全部' },
            { id: '提问', name: '提问' },
            { id: '分享', name: '分享' },
            { id: '建议', name: '建议' },
            { id: '讨论', name: '讨论' },
            { id: '动态', name: '动态' },
            { id: '其他', name: '其他' },
            { id: '算法题解', name: '算法题解' },
        ]);

        // 用户ID转换为用户名的函数
        const userIdToName = async (userId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/find/${userId}`);
                const data = await response.json();
                if (data.error_msg === 'success') {
                    return data.user.username;
                }
                return '未知用户';
            } catch (error) {
                console.error('获取用户名失败:', error);
                return '未知用户';
            }
        }

        // 批量获取用户名
        const loadUserNames = async () => {
            if (!props.posts) return;

            for (const post of props.posts) {
                if (!userNames.value[post.publishUserId]) {
                    const name = await userIdToName(post.publishUserId);
                    userNames.value[post.publishUserId] = name;
                }
            }
        };

        // 监听posts变化，重新加载用户名
        watch(() => props.posts, loadUserNames, { immediate: true });

        // 过滤帖子的计算属性
        const filteredPosts = computed(() => {
            if (selectedCategory.value === 'all') {
                return props.posts;
            }
            return props.posts.filter(post => post.postCategoryName === selectedCategory.value);
        });

        // 切换分类的方法
        const changeCategory = (category) => {
            selectedCategory.value = category;
        };

        // 跳转到帖子详情页
        const goToPostDetail = (postId) => {
            router.push(`/post/${postId}`);
        };

        // 切换页码
        const changePage = (page) => {
            emit('change-page', page);
        };

        // 格式化日期
        const formatDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleString();
        };

        // 获取内容预览
        const getContentPreview = (content) => {
            if (!content) return '无内容预览';
            // 移除Markdown标记，并截取前100个字符作为预览
            const plainText = content
                // 处理标题、加粗、斜体、代码、链接、引用、列表等Markdown语法
                .replace(/^#+\s+/gm, '') // 标题
                .replace(/![(.*?)]\((.*?)\)/g, '') // 图片
                .replace(/[(.*?)]\((.*?)\)/g, '$1') // 链接，保留链接文本
                .replace(/```[\s\S]*?```/g, '') // 代码块
                .replace(/`([^`]+)`/g, '$1') // 行内代码
                .replace(/\*\*([^*]+)\*\*/g, '$1') // 加粗
                .replace(/\*([^*]+)\*/g, '$1') // 斜体
                .replace(/~~([^~]+)~~/g, '$1') // 删除线
                .replace(/^>\s+/gm, '') // 引用
                .replace(/^[-*+]\s+/gm, '') // 无序列表
                .replace(/^\d+\.\s+/gm, '') // 有序列表
                .replace(/<img.*?>/g, '') // HTML图片标签
                .replace(/<[^>]*>/g, '') // 其他HTML标签
                .replace(/\|.*\|/g, '') // 表格
                .replace(/^-{3,}$/gm, '') // 水平分割线
                .replace(/\[.*?\]:/g, '') // 引用链接定义
                .replace(/\s*[*`[]()_>~!|{}=+-]\s*/g, ' ') // 清理剩余的特殊字符
                .replace(/\b(https?:\/\/[^\s]+)/g, '') // 移除URL
                .replace(/\n/g, ' ') // 换行替换为空格
                .replace(/\s+/g, ' ') // 多个空格合并为一个
                .trim();
            return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
        };

        return {
            goToPostDetail,
            changePage,
            formatDate,
            getContentPreview,
            userNames,
            selectedCategory,
            categories,
            filteredPosts,
            changeCategory
        }
    }
}
</script>

<style scoped>
/* 用户帖子部分样式 */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.section-title {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.section-title i {
  color: #6a9eda;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(106, 158, 218, 0.2);
  border-left-color: #6a9eda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message, .empty-posts {
  text-align: center;
  padding: 3rem;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-message i, .empty-posts i {
  font-size: 3rem;
  color: #ff6b6b;
}

.empty-posts i {
  color: #6a9eda;
}

.posts-list {
  display: grid;
  gap: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #6a9eda;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.post-category {
  background: #6a9eda;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.post-preview {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 0.9rem;
}

.post-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background: #f0f0f0;
}

.page-btn.active {
  background: #6a9eda;
  color: white;
  border-color: #6a9eda;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 2rem 0;
  padding: 0 1rem;
}

.category-btn {
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  background-color: #fff;
}

.category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-btn.btn-primary {
  background-color: #007bff;
  color: white;
}

.category-btn.btn-outline-primary {
  border: 1px solid #007bff;
  color: #007bff;
}

.category-btn .badge {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.9);
}

.btn-primary .badge {
  color: #007bff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-buttons {
    justify-content: center;
    padding: 0;
  }

  .category-btn {
    min-width: 80px;
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
  
  .post-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .post-category {
    align-self: flex-start;
  }

  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
