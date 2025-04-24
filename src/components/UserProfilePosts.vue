<template>
<div class="card">
    <div class="card-body">
        <h3 class="mb-4">帖子列表</h3>

        <!-- 分类按钮组 -->
        <div class="category-buttons mb-4">
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
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2">正在加载帖子列表...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ errorMessage }}</p>
            <hr>
            <p class="mb-0">请检查网络连接或稍后再试。</p>
        </div>

        <!-- 帖子列表内容 -->
        <div v-else>
            <!-- 无数据提示 -->
            <div v-if="filteredPosts.length === 0" class="alert alert-info" role="alert">
                当前分类暂无帖子
            </div>

            <!-- 帖子卡片列表 -->
            <div v-else>
                <div v-for="post in filteredPosts" :key="post.postId" class="mb-3">
                    <div class="card single-post" @click="goToPostDetail(post.postId)">
                        <div class="card-body">
                            <h5 class="card-title">{{ post.postTitle }}</h5>
                           <div class="row">
                                <div class="col-9">
                                    <p class="card-text text-muted small d-flex flex-wrap align-items-center gap-3">
                                        <span>发布时间: {{ formatDate(post.createTime) }}</span>
                                        <span class="post-info-item">阅读量: {{ post.postViews || 0 }}</span>
                                        <span class="post-info-item">收藏: {{ post.postCollects || 0 }}</span>
                                        <span class="post-info-item">作者: {{ userNames[post.publishUserId] || '加载中...' }}</span>
                                    </p>
                                </div>
                                <div class="col-3">
                                    <span class="mark-show-category badge bg-primary me-2">{{ post.postCategoryName }}</span>
                                </div>
                           </div>

                            <p class="card-text post-content-preview">{{ getContentPreview(post.postContent) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页导航 -->
            <nav v-if="totalPages > 1" aria-label="帖子分页" class="my-4">
                <ul class="pagination justify-content-center">
                    <!-- 上一页按钮 -->
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="上一页">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>

                    <!-- 页码按钮 -->
                    <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>

                    <!-- 下一页按钮 -->
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="下一页">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
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
.single-post{
    margin-bottom: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    border-left: 4px solid #007bff;
}
.mark-show-category{
    font-size: 0.8rem;
}

.single-post:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-content-preview {
    color: #6c757d;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.pagination .page-link {
    color: #007bff;
}

.pagination .page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
}

.post-info-item {
    /* 移除右边距，因为现在使用了 gap */
    margin-right: 0;
    /* 可以添加一个小图标或分隔符 */
    position: relative;
    display: inline-flex;
    align-items: center;
}

/* 可选：添加分隔点 */
.post-info-item::before {
    content: "•";
    margin-right: 8px;
    color: #dee2e6;
    display: none;  /* 默认隐藏 */
}

.post-info-item:first-child::before {
    display: none;  /* 第一个项目不显示分隔点 */
}

.category-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
}

.category-btn {
    position: relative;
    transition: all 0.3s ease;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

.category-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.category-btn .badge {
    border-radius: 12px;
    font-size: 0.75rem;
}

/* 选中状态的按钮样式 */
.btn-primary {
    background: linear-gradient(145deg, #007bff, #0056b3);
    border: none;
    box-shadow: 0 4px 15px rgba(0,123,255,0.2);
}

.btn-outline-primary:hover {
    background: linear-gradient(145deg, #007bff, #0056b3);
    border: none;
}

/* 添加响应式支持 */
@media (max-width: 768px) {
    .category-buttons {
        justify-content: center;
    }
    
    .category-btn {
        min-width: 80px;
        font-size: 0.9rem;
    }
}
</style>
