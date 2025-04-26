<template>
  <div class="post-actions">
    <div class="action-group">
      <button 
        class="action-button like"
        :class="{ 'is-active': isLiked }"
        @click="handleLike"
        :disabled="loading"
      >
        <div class="button-content">
          <div class="icon-wrapper">
            <i class="bi" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
          </div>
          <span class="count">{{ formatCount(likeCount) }}</span>
        </div>
        <div class="hover-effect"></div>
      </button>

      <button 
        class="action-button collect"
        :class="{ 'is-active': isCollected }"
        @click="handleCollect"
        :disabled="loading"
      >
        <div class="button-content">
          <div class="icon-wrapper">
            <i class="bi" :class="isCollected ? 'bi-bookmark-fill' : 'bi-bookmark'"></i>
          </div>
          <span class="count">{{ formatCount(collectCount) }}</span>
        </div>
        <div class="hover-effect"></div>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { likePost } from '@/api/post';

export default {
  name: 'PostActions',
  props: {
    postId: {
      type: [String, Number],
      required: true
    },
    initialLikes: {
      type: Number,
      default: 0
    },
    initialCollects: {
      type: Number,
      default: 0
    },
    initialIsLiked: {
      type: Boolean,
      default: false
    },
    initialIsCollected: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const store = useStore();
    const router = useRouter();
    const loading = ref(false);

    const likeCount = ref(props.initialLikes);
    const collectCount = ref(props.initialCollects);
    const isLiked = ref(props.initialIsLiked);
    const isCollected = ref(props.initialIsCollected);

    const checkAuth = () => {
      if (!store.state.user.is_login) {
        router.push('/login');
        return false;
      }
      return true;
    };

    const handleLike = async () => {
      if (!checkAuth() || loading.value) return;
      
      loading.value = true;
      try {
        const response = await likePost(props.postId);
        if (response.error_msg === 'success') {
          isLiked.value = !isLiked.value;
          likeCount.value += isLiked.value ? 1 : -1;
        }
      } catch (error) {
        console.error('点赞失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleCollect = async () => {
      if (!checkAuth() || loading.value) return;

      loading.value = true;
      try {
        const response = await store.dispatch('collectPost', props.postId);
        if (response.error_msg === 'success') {
          isCollected.value = !isCollected.value;
          collectCount.value += isCollected.value ? 1 : -1;
        }
      } catch (error) {
        console.error('收藏失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 添加数字格式化函数
    const formatCount = (count) => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
      }
      return count;
    };

    return {
      likeCount,
      collectCount,
      isLiked,
      isCollected,
      loading,
      handleLike,
      handleCollect,
      formatCount
    };
  }
};
</script>

<style scoped>
.post-actions {
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
}

.action-group {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 15px;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.action-button i {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.count {
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  min-width: 1.5rem;
  text-align: left;
}

.hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 15px;
}

/* 点赞按钮样式 */
.like {
  color: #ff4757;
}

.like:hover .hover-effect {
  opacity: 0.1;
}

.like.is-active {
  background: rgba(255, 71, 87, 0.1);
}

.like.is-active i,
.like.is-active .count {
  color: #ff4757;
}

/* 收藏按钮样式 */
.collect {
  color: #ffa000;
}

.collect:hover .hover-effect {
  opacity: 0.1;
}

.collect.is-active {
  background: rgba(255, 160, 0, 0.1);
}

.collect.is-active i,
.collect.is-active .count {
  color: #ffa000;
}

/* 禁用状态 */
.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 点击动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.action-button:active:not(:disabled) {
  animation: pulse 0.2s ease-in-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-group {
    gap: 1rem;
  }

  .action-button {
    padding: 0.6rem 1.4rem;
  }
}
</style>
