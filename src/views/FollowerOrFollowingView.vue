<template>
    <div class="follower-following-container">
        <!-- 页面标题和切换按钮 -->
        <div class="page-header">
            <h2 class="page-title">{{ currentView === 'followers' ? '粉丝列表' : '关注列表' }}</h2>
            <div class="view-toggle">
                <button :class="['toggle-btn', { active: currentView === 'followers' }]"
                    @click="switchView('followers')">
                    <i class="bi bi-people-fill"></i>
                    粉丝列表
                </button>
                <button :class="['toggle-btn', { active: currentView === 'followings' }]"
                    @click="switchView('followings')">
                    <i class="bi bi-person-plus-fill"></i>
                    关注列表
                </button>
            </div>
        </div>

        <!-- 用户列表 -->
        <div class="user-list">
            <div v-if="loading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
            </div>

            <div v-else-if="users.length === 0" class="empty-state">
                <i class="bi bi-emoji-smile"></i>
                <p>{{ currentView === 'followers' ? '还没有粉丝哦~' : '还没有关注任何人哦~' }}</p>
            </div>

            <div v-else class="user-grid">
                <div v-for="user in users" :key="user.id" class="user-card" @click="navigateToUser(user.id)">
                    <div class="user-avatar">
                        <img :src="user.photo || require('../assets/mylogo.png')" :alt="user.username">
                    </div>
                    <div class="user-info">
                        <h3 class="username">{{ user.username }}</h3>
                        <p class="user-bio">{{ user.bio || '这个人很懒，什么都没写~' }}</p>
                    </div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <i class="bi bi-people"></i>
                            <span>{{ user.follows || 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <i class="bi bi-person-plus"></i>
                            <span>{{ user.followings || 0 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getFollowers, getFollowings } from '@/api/user'

export default {
    name: 'FollowerOrFollowingView',
    props: {
        userId: {
            type: [String, Number],
            required: true
        }
    },
    setup(props) {
        const router = useRouter()
        const route = useRoute()
        const store = useStore()

        // 从查询参数获取当前视图类型，默认为 'followers'
        const currentView = ref(route.query.view || 'followers')
        const users = ref([])
        const loading = ref(true)

        // 获取用户列表数据
        const fetchUsers = async () => {
            loading.value = true
            // 构建API URL，根据当前视图类型获取不同的数据
            const endpoint = currentView.value === 'followers' ? 'followers' : 'followings'
            const targetUserId = props.userId || store.state.user.id
            try {
                const response = await (endpoint === 'followers' ? getFollowers(targetUserId) : getFollowings(targetUserId))
                if (response.success === true) {
                    users.value = response.data.userFollow
                } else {
                    throw new Error(response.error_msg || '获取用户列表失败')
                }
            } catch (err) {
                console.error('获取用户列表失败:', err)
            } finally {
                loading.value = false
            }
        }

               
      
        // 切换视图并更新URL
        const switchView = (view) => {
            if (currentView.value === view) return

            // 更新URL查询参数
            router.push({
                name: 'FollowerOrFollowing',
                params: { userId: props.userId },
                query: { view }
            })
        }

        // 导航到用户详情页
        const navigateToUser = (userId) => {
            router.push({ name: 'UserDesc', params: { userId } })
        }

        // 监听查询参数变化
        watch(() => route.query.view, (newView) => {
            if (newView && newView !== currentView.value) {
                currentView.value = newView
                fetchUsers()
            }
        })

        // 监听用户ID变化
        watch(() => props.userId, (newId, oldId) => {
            if (newId !== oldId) {
                fetchUsers()
            }
        })

        // 组件挂载时获取数据
        onMounted(() => {
            fetchUsers()
        })

        return {
            currentView,
            users,
            loading,
            switchView,
            navigateToUser
        }
    }
}
</script>

<style scoped>
.follower-following-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
}

.page-title {
    font-size: 2rem;
    color: #1f2937;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #3730a3 0%, #5b21b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.view-toggle {
    display: flex;
    gap: 1rem;
    background: #f3f4f6;
    padding: 0.5rem;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    background: transparent;
    color: #6b7280;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.toggle-btn i {
    font-size: 1.2rem;
}

.toggle-btn.active {
    background: white;
    color: #4f46e5;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
}

.user-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.user-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.user-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.user-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.user-card:hover::before {
    opacity: 1;
}

.user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 3px solid #e5e7eb;
    transition: border-color 0.3s ease;
}

.user-card:hover .user-avatar {
    border-color: #4f46e5;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    margin-bottom: 1rem;
}

.username {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.user-bio {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.user-stats {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.9rem;
}

.stat-item i {
    color: #4f46e5;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #6b7280;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #6b7280;
    text-align: center;
}

.empty-state i {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .view-toggle {
        width: 100%;
    }

    .toggle-btn {
        flex: 1;
        justify-content: center;
    }

    .user-grid {
        grid-template-columns: 1fr;
    }
}
</style>
