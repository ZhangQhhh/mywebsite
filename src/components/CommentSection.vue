<template>
  <div class="comment-section">
    <!-- 评论输入和列表容器 -->
    <div class="comment-input-container">
      <u-comment-scroll :disable="scrollDisabled" @more="loadMore">
        <u-comment 
          :config="commentConfig" 
          @submit="submitComment"
          @reply="handleReply"
          @like="handleLike"
          @mention-search="handleMentionSearch"
        />
        <!-- 添加加载状态提示 -->
        <div v-if="isLoading" class="loading-state">
          <span>加载中...</span>
        </div>
      </u-comment-scroll>
    </div>

 
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, getCurrentInstance, watch } from 'vue';
import { useStore } from 'vuex';
import { commentApi } from '@/api/comment';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import emoji from '@/assets/emoji/emoji';

// 确保已经在 main.js 中全局引入了 undraw-ui
// import UndrawUi from 'undraw-ui'
// app.use(UndrawUi)

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export default {
  name: 'CommentSection',
  props: {
    contentId: {
      type: [String, Number],
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  setup(props) {
    console.log('Emoji config:', emoji);
    const store = useStore();
    const { proxy } = getCurrentInstance();
    
    // 添加滚动加载相关的状态
    const scrollDisabled = ref(false);
    const currentPage = ref(1);
    const isLoading = ref(false);

    // 修改 commentConfig，移除分页相关配置
    const commentConfig = reactive({
      user: {
        id: store.state.user?.id,
        username: store.state.user?.username,
        avatar: store.state.user?.photo,
        level: store.state.user?.level || 1,
        homeLink: store.state.user?.id ? `/user/${store.state.user.id}` : ''
      },
      emoji: emoji,
      comments: [],
      relativeTime: true,  // 改为 true，启用相对时间
      showLevel: true,
      showHomeLink: true,
      showLikes: true
    });

    // 添加加载更多的处理函数
    const loadMore = async () => {
      if (isLoading.value) return;
      
      try {
        isLoading.value = true;
        const response = await commentApi.getCommentList({
          pageNum: currentPage.value,
          pageSize: props.pageSize
        }, props.contentId);

        if (response.success === true) {
          const newComments = response.data.comments.map(comment => ({
            id: String(comment.id),
            parentId: comment.parentId || null,
            uid: String(comment.userId),
            address: comment.address || '来自火星',
            content: comment.content,
            createTime: dayjs(comment.createdAt).toString(), // 使用toString()
            user: {
              id: comment.userId,
              username: comment.userName,
              avatar: comment.userAvatar,
              level: comment.userLevel || 1,
              homeLink: `/user/${comment.userId}`
            },
            likes: comment.likesCount || 0,
            liked: comment.liked || false,
            reply: null
          }));

          if (currentPage.value === 1) {
            commentConfig.comments = newComments;
          } else {
            commentConfig.comments.push(...newComments);
          }

          if (newComments.length < props.pageSize) {
            scrollDisabled.value = true;
          } else {
            currentPage.value++;
          }
        }
      } catch (err) {
        console.error('加载评论失败:', err);
        proxy.$message.error('加载评论失败');
      } finally {
        isLoading.value = false;
      }
    };

    // 初始加载评论
    onMounted(() => {
      loadMore();
    });

    // 添加组件卸载前的清理
    onBeforeUnmount(() => {
      try {
        // 清理评论数据
        commentConfig.comments = [];
        // 重置所有状态
        currentPage.value = 1;
        scrollDisabled.value = false;
        isLoading.value = false;
      } catch (error) {
        console.error('组件卸载清理失败:', error);
      }
    });

    // 监听 contentId 变化，重置并重新加载评论
    watch(() => props.contentId, (newVal) => {
      if (newVal) {
        currentPage.value = 1;
        scrollDisabled.value = false;
        commentConfig.comments = [];
        loadMore();
      }
    });

    // 处理@用户搜索
    const handleMentionSearch = async (val) => {
      try {
        // 这里需要实现一个搜索用户的API
        const response = await commentApi.searchUsers(val);
        if (response.success === true) {
          commentConfig.mention.data = response.data;
        }
      } catch (err) {
        console.error('搜索用户失败:', err);
      }
    };

    // 提交评论
    const submitComment = async ({ content, parentId, finish }) => {
      if (!store.state.user.token) {
        proxy.$message.error('请先登录');
        return;
      }
      
      try {
        const response = await commentApi.addComment({
          contentId: props.contentId,
          contentType: 'ARTICLE', // 添加内容类型，根据实际业务定义，如：POST/ARTICLE/VIDEO等
          userId: store.state.user.id,
          content: content,
          parentId: parentId || null, // 没有父Id就是null
          replyToUserId: 0, // 普通评论时无需回复用户ID
          likesCount: 0, // 新评论点赞数初始化为0
          status: 1 // 假设1为正常状态
        });

        if (response.success === true) {
          // 构造更完整的评论数据结构
          const commentData = {
            id: String(response.data.id),
            parentId: parentId,
            uid: store.state.user.id,
            address: response.data.address || '来自火星', // 添加address字段
            content: content,
            createTime: dayjs(response.data.createdAt).toString(), // 使用toString()而不是fromNow()
            user: {
              id: store.state.user.id,
              username: store.state.user.username,
              avatar: store.state.user.photo,
              level: store.state.user.level || 1,
              homeLink: `/user/${store.state.user.id}` // 添加用户主页链接
            },
            likes: 0,
            liked: false,
            reply: null
          };

          console.log('提交评论数据结构:', commentData);
          finish(commentData);
          
          proxy.$message.success('评论发表成功');
          await loadMore();
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        console.error('评论发表失败:', err);
        proxy.$message.error('评论发表失败');
      }
    };

    // 监听用户登录状态变化
    watch(() => store.state.user, (newUser) => {
      if (newUser) {
        commentConfig.user = {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar
        };
      }
    }, { deep: true });

    // 处理点赞/取消点赞
    const handleLike = async (comment) => {
      if (!store.state.user.token) {
        proxy.$message.error('请先登录');
        return;
      }

      try {
        const response = comment.liked
          ? await commentApi.unlikeComment(comment.id)
          : await commentApi.likeComment(comment.id);

        if (response.error_msg === 'success') {
          // 更新评论的点赞状态
          comment.liked = !comment.liked;
          comment.likes = response.data.likes;
          proxy.$message.success(comment.liked ? '点赞成功' : '已取消点赞');
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        proxy.$message.error(comment.liked ? '取消点赞失败' : '点赞失败');
        console.error('点赞操作失败:', err);
      }
    };

    // 处理回复评论
    const handleReply = async ({ content, parentId, replyTo, finish }) => {
      if (!store.state.user.token) {
        proxy.$message.error('请先登录');
        return;
      }

      try {
        const response = await commentApi.replyComment({
          contentId: props.contentId,
          contentType: 'ARTICLE', // 添加内容类型
          userId: store.state.user.id,
          content: content,
          parentId: parentId,
          replyToUserId: replyTo.uid, // 回复时需要设置被回复用户ID
          likesCount: 0,
          status: 1
        });

        if (response.success === true) {
          finish({
            id: response.data.id,
            parentId: response.data.parentId,
            uid: response.data.userId,
            content: response.data.content,
            createTime: dayjs(response.data.createdAt).fromNow(),
            user: {
              username: response.data.username,
              avatar: response.data.avatar
            },
            likes: 0,
            liked: false,
            reply: {
              username: replyTo.username,
              uid: replyTo.uid
            }
          });
          
          proxy.$message.success('回复发表成功');
          await loadMore();
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        proxy.$message.error('回复发表失败');
        console.error('回复发表失败:', err);
      }
    };

    // 添加回复分页处理函数
    const handleReplyPage = async ({ parentId, current, size, finish }) => {
      try {
        const response = await commentApi.getReplyList({
          parentId,
          page: current,
          pageSize: size
        });
        console.log('handleReplyPage API响应:', response);
        if (response.success === true) {
          const replyData = {
            total: response.data.total,
            list: response.data.list.map(reply => ({
              id: String(reply.id),
              parentId: String(reply.parentId),
              uid: String(reply.userId),
              content: reply.content,
              createTime: dayjs(reply.createdAt).fromNow(),
              user: {
                username: reply.userName,
                avatar: reply.userAvatar,
                level: reply.userLevel || 1
              },
              likes: reply.likesCount || 0
            }))
          };
          
          finish(replyData);
        }
      } catch (err) {
        console.error('加载回复列表失败:', err);
      }
    };

    return {
      commentConfig,
      scrollDisabled,
      isLoading,
      loadMore,
      submitComment,
      handleMentionSearch,
      handleLike,
      handleReply,
      handleReplyPage
    };
  }
}
</script>

<style scoped>
/* 移除任何使用 high-contrast 的媒体查询 */
/* 使用新的 forced-colors 媒体查询 */
@media (forced-colors: active) {
  .comment-section {
    forced-color-adjust: auto;
  }
}

/* 评论按钮样式保持不变 */
.u-comment .comment-submit {
  background: linear-gradient(45deg, #4a90e2, #357abd) !important;
  color: white !important;
  padding: 8px 24px !important;
  border-radius: 20px !important;
  font-weight: 500 !important;
  border: none !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.2) !important;
  height: auto !important;
  line-height: normal !important;
}

.u-comment .comment-submit:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3) !important;
  background: linear-gradient(45deg, #357abd, #2868a9) !important;
}

.u-comment .comment-submit:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.2) !important;
}

/* 评论框容器样式 */
.comment-section {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.comment-input-container {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 评论输入框样式 */
.u-comment .comment-textarea {
  border: 1px solid #e8e8e8 !important;
  border-radius: 8px !important;
  padding: 12px !important;
  transition: all 0.3s ease !important;
  background: #fff !important;
}

.u-comment .comment-textarea:focus {
  border-color: #4a90e2 !important;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1) !important;
}

/* 表情按钮样式 */
.u-comment .emoji-btn {
  color: #666 !important;
  transition: all 0.3s ease !important;
}

.u-comment .emoji-btn:hover {
  color: #4a90e2 !important;
}

/* 评论操作按钮样式 */
.u-comment .operation-btn {
  color: #666 !important;
  transition: all 0.3s ease !important;
}

.u-comment .operation-btn:hover {
  color: #4a90e2 !important;
}

/* 加载状态样式 */
.loading-container {
  text-align: center;
  padding: 20px;
}

.loading-text {
  margin-left: 10px;
  color: #666;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 0;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading-state {
  text-align: center;
  padding: 15px 0;
  color: #666;
  font-size: 14px;
}

/* 可以添加一个加载动画 */
.loading-state::after {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid #666;
  border-top-color: transparent;
  border-radius: 50%;
  animation: loading 0.8s linear infinite;
}

@keyframes loading {
  to {
    transform: rotate(360deg);
  }
}
</style>


























