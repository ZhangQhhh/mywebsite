<template>
  <div class="comment-section">
    <!-- 评论输入和列表容器 -->
    <div class="comment-input-container">
      <u-comment 
        :config="commentConfig" 
        @submit="submitComment"
        @reply="handleReply"
        @like="handleLike"
        @mention-search="handleMentionSearch"
      />
    </div>

 
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue';
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
    
    // 状态数据
    const comments = ref([]);
    const currentPage = ref(1);
    const totalComments = ref(0);
    const isLoading = ref(false);

    // undraw-ui 评论配置
    const commentConfig = reactive({
      user: {
        id: store.state.user?.id,
        username: store.state.user?.username,
        avatar: store.state.user?.photo
      },
      emoji: emoji,
      comments: comments.value,
      showLevel: false,
      showHomeLink: false,
      showAddress: false,
      showLikes: true,
      mention: {
        data: [],
        alias: {
          username: 'username'
        },
        showAvatar: true
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

    // 加载评论列表
    const loadComments = async () => {
      if (!props.contentId) return;

      isLoading.value = true;

      try {
        const response = await commentApi.getCommentList({
          page: currentPage.value,
          pageSize: props.pageSize
        }, props.contentId);

        if (response.success === true) {
          comments.value = response.data.comments.map(comment => ({
            id: comment.id,
            parentId: comment.parentId,
            uid: comment.userId,
            content: comment.content,
            createTime: dayjs(comment.createdAt).fromNow(),
            user: {
              username: comment.userName,
              avatar: comment.userAvatar
            },
            likes: comment.likesCount,
            // liked: comment.liked,
            liked: false,
            reply: comment.replyToUsername ? {
              username: comment.replyToUsername,
              uid: comment.replyToUserId
            } : null
          }));
          commentConfig.comments = comments.value;
          totalComments.value = response.data.total || 0;
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        proxy.$message.error('加载评论失败');
        console.error('加载评论失败:', err);
      } finally {
        isLoading.value = false;
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
          parentId: parentId || null,
          replyToUserId: null, // 普通评论时无需回复用户ID
          likesCount: 0, // 新评论点赞数初始化为0
          status: 1 // 假设1为正常状态
        });

        if (response.success === true) {
          finish({
            id: response.data.id,
            parentId: response.data.parentId,
            uid: response.data.userId,
            content: response.data.content,
            createTime: dayjs(response.data.createdAt).fromNow(),
            user: {
              username: response.data.userName,
              avatar: response.data.userAvatar
            },
            likes: 0,
            liked: false
          });
          
          proxy.$message.success('评论发表成功');
          await loadComments();
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        proxy.$message.error('评论发表失败');
        console.error('评论发表失败:', err);
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

    // 监听 contentId 变化
    watch(() => props.contentId, (newVal) => {
      if (newVal) {
        currentPage.value = 1;
        loadComments();
      }
    });

    // 组件挂载时加载评论
    onMounted(() => {
      loadComments();
    });

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
          await loadComments();
        } else {
          proxy.$message.error(response.error_msg);
        }
      } catch (err) {
        proxy.$message.error('回复发表失败');
        console.error('回复发表失败:', err);
      }
    };

    return {
      comments,
      isLoading,
      totalComments,
      currentPage,
      commentConfig,
      loadComments,
      submitComment,
      handleMentionSearch,
      handleLike,
      handleReply
    };
  }
}
</script>

<style scoped>


/* 评论按钮样式 */
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
</style>






