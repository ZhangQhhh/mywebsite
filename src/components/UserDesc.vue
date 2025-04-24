<template>
    <Content>
      <div class="user-profile-container">
        <!-- 用户信息卡片 -->
        <div class="user-info-card">
          <div class="user-header">
            <div class="avatar-container">
              <img :src="user.photo || require('@/assets/mylogo.png')" alt="用户头像" class="user-avatar">
              <div class="avatar-overlay">
                <i class="bi bi-person-fill"></i>
              </div>
            </div>
            <div class="user-details">
              <h2 class="username">{{ user.username }}</h2>
              <p v-if="user.status === 1" class="user-status active">
                <i class="bi bi-check-circle-fill"></i> 正常状态
              </p>
              <p v-else class="user-status banned">
                <i class="bi bi-x-circle-fill"></i> 已被封禁
              </p>
              <p class="user-role">
                <i class="bi bi-award-fill"></i> 
                {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
                <span v-if="user.vip === '1' || user.vip === 1 || user.vip === true" class="vip-badge">
                  <i class="bi bi-stars"></i> VIP会员
                </span>
              </p>
            </div>
          </div>
          
          <div class="user-info-section">
            <div class="info-item">
              <i class="bi bi-envelope-fill"></i>
              <span>邮箱：{{ user.email || '未设置邮箱' }}</span>
            </div>
            <div class="info-item">
              <i class="bi bi-calendar-fill"></i>
              <span>注册时间：{{ formatDate(user.createTime) }}</span>
            </div>
            <div class="info-item">
              <i class="bi bi-geo-alt-fill"></i>
              <span>所在地区：{{ user.location || '未设置地区' }}</span>
            </div>
            <div class="info-item">
              <i class="bi bi-journal-richtext"></i>
              <span>个人简介：</span>
            </div>
            <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
          </div>
          
          <div class="social-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStats.postCount || 0 }}</span>
              <span class="stat-label">发帖数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.followCount || 0 }}</span>
              <span class="stat-label">关注数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.followerCount || 0 }}</span>
              <span class="stat-label">粉丝数</span>
            </div>
          </div>
          
          <div class="action-buttons" v-if="!isCurrentUser">
            <button class="btn action-btn follow-btn" @click="followUser" v-if="!user.is_followed">
              <i class="bi bi-person-plus-fill"></i> 关注
            </button>
            <button class="btn action-btn unfollow-btn" @click="unfollowUser" v-else>
              <i class="bi bi-person-dash-fill"></i> 取消关注
            </button>
            <button class="btn action-btn message-btn" @click="sendMessage">
              <i class="bi bi-chat-dots-fill"></i> 发送消息
            </button>
          </div>
        </div>
  
        <!-- 用户帖子部分 -->
        <div class="user-posts-section">
          <h3 class="section-title">
            <i class="bi bi-file-earmark-text"></i> 发布的帖子
          </h3>
          
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
          <div v-else-if="posts.length === 0" class="empty-posts">
            <i class="bi bi-file-earmark-x"></i>
            <p>暂无发布的帖子</p>
          </div>
          
          <!-- 帖子列表 -->
          <div v-else class="posts-list">
            <div v-for="post in posts" :key="post.postId" class="post-card" @click="goToPostDetail(post.postId)">
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
    </Content>
  </template>
  
  <script>
  import Content from '@/components/ContentBase';
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter, useRoute } from 'vue-router';
  import { getUserInfo } from '@/api/profile';
  import { getUserStats, toggleFollow, checkFollowStatus } from '@/api/UserMessage';
  import { getUserPosts } from '@/api/post';
  
  export default {
    name: "UserDesc",
    components: {
      Content
    },
    props: {
      userId: {
        type: [String, Number],
        default: null
      }
    },
    setup(props) {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      
      // 用户基本信息
      const user = reactive({
        id: '',
        username: '',
        email: '',
        photo: '',
        role: '',
        status: '1',
        vip: 0,
        createTime: '',
        location: '',
        bio: '',
        is_followed: false
      });
      
      
      // 用户统计信息
      const userStats = reactive({
        postCount: 0,
        followCount: 0,
        followerCount: 0
      });
      
      // 帖子相关数据
      const posts = ref([]);
      const loading = ref(true);
      const error = ref(false);
      const errorMessage = ref('');
      
      // 分页相关数据
      const currentPage = ref(1);
      const pageSize = ref(5);
      const totalItems = ref(0);
      const totalPages = ref(1);
      
      // 检查是否为当前登录用户查看自己的资料
      const isCurrentUser = computed(() => {
        return user.id === store.state.user.id;
      });
      
      // 计算显示哪些页码按钮
      const displayedPages = computed(() => {
        const maxPagesToShow = 5;
        const pages = [];
        
        let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
          startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        return pages;
      });
      
      // 初始化用户信息
      const initUserInfo = async () => {
        // 获取用户ID，优先使用props传入的，其次使用路由参数，最后使用当前登录用户
        const targetUserId = props.userId || route.params.userId || store.state.user.id;
        console.log('targetUserId:', targetUserId);

        // 如果没有有效的用户ID，则返回
        if (!targetUserId) {
          error.value = true;
          errorMessage.value = '无效的用户ID';
          return;
        }
        
        // 设置用户ID
        user.id = targetUserId;
        
        try {
          // 如果是当前登录用户，直接使用store中的用户信息
          if (targetUserId === store.state.user.id) {
            user.username = store.state.user.username;
            user.photo = store.state.user.photo;
            user.role = store.state.user.role;
            user.status = store.state.user.status;
            user.vip = store.state.user.vip;
          } else {
            // 获取目标用户信息
            const userInfoResponse = await getUserInfo(targetUserId);
            if (userInfoResponse.error_msg === 'success') {
              Object.assign(user, userInfoResponse.user);
            } else {
              throw new Error(userInfoResponse.error_msg || '获取用户信息失败');
            }
            
            // 检查关注状态
            const currentUserId = store.state.user.id;
            const followStatusResponse = await checkFollowStatus(targetUserId,currentUserId);
            if (followStatusResponse.success === true) {
              user.is_followed = followStatusResponse.data.isFollowing;
            } else{
              throw new Error(followStatusResponse.error_msg || '检查关注状态失败');
            }
          }
          
          //获取用户统计信息（TODO 记得实现）
          const statsResponse = await getUserStats(targetUserId);
          if (statsResponse.success === true) {
            Object.assign(userStats, statsResponse.data);
          }
          
          // 加载用户帖子
          await loadUserPosts();
          
        } catch (err) {
          console.error('初始化用户信息失败:', err);
          error.value = true;
          errorMessage.value = err.message || '获取用户信息失败';
        }
      };
      
      // 加载用户帖子
      const loadUserPosts = async () => {
        loading.value = true;
        error.value = false;
        
        try {
          const response = await getUserPosts(
            {
              pageNum: currentPage.value,
              pageSize: pageSize.value
            },
            user.id
          );
          
          if (response.error_msg === 'success') {
            posts.value = response.posts || [];
            totalItems.value = response.total || 0;
            totalPages.value = response.totalPages || 1;
            
            // 设置用户统计信息
            userStats.postCount = response.total || 0;
          } else {
            error.value = true;
            errorMessage.value = '获取用户帖子列表失败';
          }
        } catch (err) {
          console.error('加载用户帖子列表失败:', err);
          error.value = true;
          errorMessage.value = err.message || '加载用户帖子列表失败';
        } finally {
          loading.value = false;
        }
      };
      
      // 切换页码
      const changePage = (page) => {
        if (page < 1 || page > totalPages.value) return;
        
        currentPage.value = page;
        loadUserPosts();
      };
      
      // 关注用户
      const followUser = async () => {
        try {
          const response = await toggleFollow(user.id, true);
          if (response.error_msg === 'success') {
            user.is_followed = true;
            userStats.followerCount++;
            // 如果项目中有消息提示组件，可以使用它来显示成功消息
          } else {
            throw new Error(response.error_msg || '关注失败');
          }
        } catch (err) {
          console.error('关注用户失败:', err);
          error.value = true;
          errorMessage.value = err.message || '关注失败，请稍后重试';
        }
      };
      
      // 取消关注用户
      const unfollowUser = async () => {
        try {
          const response = await toggleFollow(user.id, false);
          if (response.error_msg === 'success') {
            user.is_followed = false;
            userStats.followerCount--;
            // 如果项目中有消息提示组件，可以使用它来显示成功消息
          } else {
            throw new Error(response.error_msg || '取消关注失败');
          }
        } catch (err) {
          console.error('取消关注用户失败:', err);
          error.value = true;
          errorMessage.value = err.message || '取消关注失败，请稍后重试';
        }
      };
      
      // 发送消息
      const sendMessage = () => {
        // 跳转到消息页或显示消息对话框
        router.push(`/message?userId=${user.id}`);
      };
      
      // 跳转到帖子详情页
      const goToPostDetail = (postId) => {
        router.push(`/post/${postId}`);
      };
      
      // 格式化日期
      const formatDate = (dateString) => {
        if (!dateString) return '未知时间';
        return new Date(dateString).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      // 获取内容预览
      const getContentPreview = (content) => {
        if (!content) return '无内容预览';
        // 移除Markdown标记，并截取前100个字符作为预览
        const plainText = content.replace(/[#*`[]()_>~!|{}=+-]/g, '')
                                    .replace(/\b(https?:\/\/[^\s]+)/g, '')
                                    .replace(/\n/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
      };
      
      // 组件挂载时初始化数据
      onMounted(() => {
        initUserInfo();
      });
      
      // 监听路由变化，重新加载数据
      watch(() => route.params.userId, () => {
        initUserInfo();
      });
      
      return {
        user,
        userStats,
        posts,
        loading,
        error,
        errorMessage,
        currentPage,
        totalPages,
        displayedPages,
        isCurrentUser,
        followUser,
        unfollowUser,
        sendMessage,
        goToPostDetail,
        changePage,
        formatDate,
        getContentPreview
      };
    }
  };
  </script>
  
  <style scoped>
  .user-profile-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* 用户信息卡片样式 */
  .user-info-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .user-info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
  
  .user-header {
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, #6a9eda 0%, #9b7ade 100%);
    color: white;
    position: relative;
  }
  
  .avatar-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 1.5rem;
  }
  
  .user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .avatar-container:hover .avatar-overlay {
    opacity: 1;
  }
  
  .avatar-overlay i {
    font-size: 2rem;
    color: white;
  }
  
  .username {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .user-status {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .user-status.active {
    color: #4cd964;
  }
  
  .user-status.banned {
    color: #ff3b30;
  }
  
  .user-role {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .vip-badge {
    background: linear-gradient(45deg, #f5c035, #f98c14);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-left: 0.5rem;
    box-shadow: 0 4px 10px rgba(249, 140, 20, 0.4);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .user-info-section {
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color: #555;
  }
  
  .info-item i {
    color: #6a9eda;
    font-size: 1.1rem;
  }
  
  .user-bio {
    color: #777;
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: 8px;
    font-style: italic;
    margin-top: 0.5rem;
  }
  
  .social-stats {
    display: flex;
    justify-content: space-around;
    padding: 1.25rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #888;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    gap: 1rem;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .follow-btn {
    background: #6a9eda;
    color: white;
    border: none;
  }
  
  .follow-btn:hover {
    background: #5a8ec4;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(106, 158, 218, 0.4);
  }
  
  .unfollow-btn {
    background: white;
    color: #6a9eda;
    border: 2px solid #6a9eda;
  }
  
  .unfollow-btn:hover {
    background: #f0f7ff;
    transform: translateY(-2px);
  }
  
  .message-btn {
    background: white;
    color: #9b7ade;
    border: 2px solid #9b7ade;
  }
  
  .message-btn:hover {
    background: #f5f0ff;
    transform: translateY(-2px);
  }
  
  /* 用户帖子部分样式 */
  .user-posts-section {
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
  
  /* 响应式设计 */
  @media (max-width: 1000px) {
    .user-profile-container {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 768px) {
    .user-profile-container {
      padding: 1rem;
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
