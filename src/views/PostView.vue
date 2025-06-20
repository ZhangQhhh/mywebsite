<template>
  <Content>
    <div class="container">
      <!-- 帖子内容展示区 -->
      <div class="post-container">
        <div class="author-section">
          <div class="author-info">
            <div class="author-avatar" @click="navigateToUserProfile">
              <img :src="user.photo || require('@/assets/mylogo.png')" alt="作者头像">
            </div>
            <div class="author-details">
              <h5 class="author-name">作者：{{ user.username }}</h5>
              <p class="author-email">
                <i class="bi bi-envelope"></i>
                {{ user.email || '暂无邮箱信息' }}
              </p>
              <p class="author-email">
                <i class="bi bi-heart-fill"></i>
                {{ posts.postLikes ? `${posts.postLikes}人点赞` : '还没有人点赞' }}
              </p>
              <p class="author-email">
                <i class="bi bi-bookmark-fill"></i>
                {{ posts.postCollects ? `${posts.postCollects}人收藏` : '还没有人收藏' }}
              </p>
            </div>
          </div>
        </div>

        <div class="post-content-section">
          <div v-if="loading" class="text-center my-5 loading-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2">正在加载帖子内容...</p>
          </div>

          <div v-else-if="error" class="alert alert-danger my-4 error-container" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ errorMessage }}</p>
            <hr>
            <p class="mb-0">请检查网络连接或稍后再试。</p>
          </div>

          <div v-else class="post-body">
            <MarkShow :content="markdownContent" :title="title" :createdAt="createdTime" :category="category"
              :categoryName="categoryName" :showTitle="true" :showTime="true" :showCategory="true" />
            
            <!-- 添加点赞收藏组件 -->
            <PostActions
              :post-id="postId"
              :initial-likes="posts.postLikes"
              :initial-collects="posts.postCollects"
              :initial-is-liked="posts.isLiked"
              :initial-is-collected="posts.isCollected"
              @update:collect-count="updateCollectCount"
              @update:is-collected="updateIsCollected"
              @update:like-count="updateLikeCount"
              @update:is-liked="updateIsLiked"
            />

            <!-- 评论组件 -->
            <div class="comments-section">
              <CommentSection :contentId="postId" :pageSize="5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Content from '@/components/ContentBase.vue';
import MarkShow from '@/components/MarkShow.vue';
import CommentSection from '@/components/CommentSection.vue';
import PostActions from '@/components/PostActions.vue';
import { getPostDetail, increasePostViews } from '@/api/post';
// 导入 bootstrap-icons 样式，确保图标正确加载


export default {
  name: 'PostView',
  components: {
    Content,
    MarkShow,
    CommentSection,
    PostActions
  },
  setup() {
    // 响应式数据
    const store = useStore();
    const user = ref({});
    const posts = ref({});
    const markdownContent = ref('');
    const title = ref('');
    const createdTime = ref('');
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref('');
    const category = ref('1');
    const categoryName = ref('提问');

    // 获取路由参数和路由器
    const route = useRoute();
    const router = useRouter();
    const postId = route.params.id; // 获取帖子ID

    // 导航到用户个人主页
    const navigateToUserProfile = () => {
      if (user.value && user.value.id) {
        router.push({
          name: 'UserDesc',
          params: { userId: user.value.id }
        });
      }
    };

    // 处理内容中的图片URL，确保它们有正确的协议前缀并修复嵌套图片语法
    const processImageUrls = (content) => {
      if (!content) return content;

      let processedContent = content;

      // 首先处理嵌套的图片语法问题 - 匹配形如 ![text![text](url)text] 的嵌套图片
      const nestedImgRegex = /!\[([^[]*?)!\[([^\]]*)\]\(([^)]+)\)([^\]]*)\]/g;
      processedContent = processedContent.replace(nestedImgRegex, (match, prefix, innerAlt, innerUrl) => {
        console.log('检测到嵌套图片语法，正在修复');
        // 提取内部图片的URL和文本，重新构建正确的Markdown图片语法
        return `![${innerAlt}](${innerUrl})`;
      });

      // 然后处理普通图片链接的协议前缀
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      let tempContent = processedContent;

      // 遍历所有图片链接
      while ((match = imgRegex.exec(tempContent)) !== null) {
        const [fullMatch, altText, imageUrl] = match;

        // 检查URL是否缺少协议前缀
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          // 添加http前缀
          const newImageUrl = 'http://' + imageUrl;
          // 替换原始链接
          const newImgMarkdown = `![${altText}](${newImageUrl})`;
          processedContent = processedContent.replace(fullMatch, newImgMarkdown);
        }
      }

      return processedContent;
    };

    // 从后端加载帖子内容
    const loadPostContent = async () => {
      loading.value = true;
      error.value = false;

      try {
        // 调用API获取帖子详情
        const response = await getPostDetail(postId, store.state.user.id);

        if (response.error_msg === 'success') {
          // 使用获取到的帖子内容
          const post = response.post;
          posts.value = {
            ...post,
            isLiked: Boolean(post.isLiked),
            isCollected: Boolean(post.isCollected),
            postLikes: Number(post.postLikes) || 0,
            postCollects: Number(post.postCollects) || 0
          };
          user.value = response.user;
          // postCategoryName
          // 处理帖子内容中的图片URL
          markdownContent.value = processImageUrls(post.postContent) || '获取的内容为空';
          title.value = post.postTitle || '帖子详情';
          createdTime.value = new Date(post.createTime || Date.now()).toLocaleString();

          // 设置分类信息
          if (post.postCategoryId) {
            category.value = post.postCategoryId;
            // 这里可以根据分类ID获取分类名称，或者直接使用后端返回的分类名称
            // 如果后端返回了分类名称，可以直接使用
            categoryName.value = post.postCategoryName || '未知';
          }

        } else {
          // 如果没有获取到帖子，显示错误
          error.value = true;
          errorMessage.value = '未找到该帖子或帖子内容为空';
          markdownContent.value = '';
        }
      } catch (err) {
        console.error('加载帖子内容失败:', err);
        // 发生错误时显示错误信息
        error.value = true;
        errorMessage.value = err.message || '加载帖子内容失败';
        markdownContent.value = '';
      } finally {
        loading.value = false;
      }
    };

    // 检查是否需要增加阅读量（防止重复计数）
    const shouldIncreaseViews = (postId) => {
      // 获取已访问帖子的记录
      const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '{}');
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24小时的毫秒数

      // 检查是否在24小时内访问过该帖子
      if (viewedPosts[postId] && (now - viewedPosts[postId]) < twentyFourHours) {
        return false;
      }

      // 更新访问记录
      viewedPosts[postId] = now;
      localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
      return true;
    };

    // 增加帖子阅读量
    const increaseViews = async () => {
      try {
        // 检查是否需要增加阅读量
        if (shouldIncreaseViews(postId)) {
          // 调用API增加阅读量
          const resp = await increasePostViews(postId);
          if (resp.error_msg === 'success') {
            console.log('帖子阅读量已增加');
          }

        }
      } catch (err) {
        console.error('增加帖子阅读量失败:', err);
        // 这里不显示错误给用户，因为这不影响帖子内容的显示
      }
    };

    // 页面加载时自动获取帖子内容并增加阅读量
    onMounted(() => {
      loadPostContent();
      // 加载完成后增加阅读量
      increaseViews();
    });

    // 添加更新方法
    const updateCollectCount = (newCount) => {
      posts.value.postCollects = newCount;
    };
    
    const updateIsCollected = (newStatus) => {
      posts.value.isCollected = newStatus;
    };

    // 添加点赞更新方法
    const updateLikeCount = (newCount) => {
      posts.value.postLikes = newCount;
    };
    
    const updateIsLiked = (newStatus) => {
      posts.value.isLiked = newStatus;
    };

    // 返回需要在模板中使用的数据和方法
    return {
      markdownContent,
      title,
      createdTime,
      loading,
      error,
      errorMessage,
      category,
      categoryName,
      postId,
      user,
      posts,
      navigateToUserProfile,
      updateCollectCount,
      updateIsCollected,
      updateLikeCount,
      updateIsLiked
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 15px;
}

/* 整体帖子容器 */
.post-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
}

/* 作者信息区域 */
.author-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid #ffffff;
  transition: transform 0.3s ease;
  cursor: pointer; /* 添加指针样式指示可点击 */
}

.author-avatar:hover {
  transform: scale(1.05);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-details {
  flex: 1;
}

.author-name {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.author-email {
  margin: 0.25rem 0 0;
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-email i {
  color: #3498db;
  font-size: 1rem; /* 确保图标大小合适 */
}

/* 帖子内容区域 */
.post-content-section {
  padding: 25px;
}

.post-body {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

/* 加载和错误状态 */
.loading-container {
  padding: 30px;
  background-color: rgba(248, 249, 250, 0.7);
  border-radius: 8px;
}

.error-container {
  border-left: 5px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

/* 评论区域 */
.comments-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #dee2e6;
}
</style>
