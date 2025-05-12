<template>
  <div class="message-container" :class="{ 'message-mine': isMine }">
    <div class="message-avatar">
      <img :src="avatar" :alt="username">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="username">{{ username }}</span>
        <span class="time">{{ formattedTime }}</span>
      </div>
      <div class="message-bubble" :class="{ 'bubble-mine': isMine, 'sending': sending, 'failed': failed }">
        <!-- 根据消息类型显示不同内容 -->
        <template v-if="type === 'emoji'">
          <!-- 纯表情消息 -->
          <img :src="content" class="emoji-image" alt="emoji" @error="handleImageError">
        </template>
        <template v-else>
          <!-- 文本消息，可能包含表情 -->
          <template v-if="parsedMessage.length === 1 && !parsedMessage[0].isEmoji">
            <!-- 纯文本消息 -->
            {{ parsedMessage[0].content }}
          </template>
          <template v-else>
            <!-- 包含表情的消息 -->
            <span v-for="(part, index) in parsedMessage" :key="index">
              <img v-if="part.isEmoji" :src="part.content" class="emoji-image-inline" alt="emoji" @error="handleImageError">
              <span v-else>{{ part.content }}</span>
            </span>
          </template>
        </template>
        
        <!-- 发送状态指示器 -->
        <span v-if="sending" class="status-indicator sending">发送中...</span>
        <span v-if="failed" class="status-indicator failed">发送失败</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { computed } from 'vue';
import emoji from '@/assets/emoji.ts';

// Props 定义
const props = defineProps({
  isMine: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  time: {
    type: [String, Date],
    required: true
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'emoji'].includes(value)
  },
  sending: {
    type: Boolean,
    default: false
  },
  failed: {
    type: Boolean,
    default: false
  }
});

// 格式化时间
const formattedTime = computed(() => {
  if (!props.time) return '';
  
  const messageDate = new Date(props.time);
  const now = new Date();
  
  // 检查是否是有效日期
  if (isNaN(messageDate.getTime())) {
    return '未知时间';
  }
  
  // 获取日期部分
  const isToday = messageDate.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === messageDate.toDateString();
  
  // 格式化时间部分 (HH:MM)
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  // 根据日期情况返回不同格式
  if (isToday) {
    return timeStr; // 今天只显示时间
  } else if (isYesterday) {
    return `昨天 ${timeStr}`; // 昨天显示"昨天 HH:MM"
  } else {
    // 其他日期显示完整日期和时间
    const year = messageDate.getFullYear();
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
    const day = messageDate.getDate().toString().padStart(2, '0');
    
    // 如果是当年，不显示年份
    if (year === now.getFullYear()) {
      return `${month}-${day} ${timeStr}`;
    } else {
      return `${year}-${month}-${day} ${timeStr}`;
    }
  }
});

// 检查是否是单个表情消息
// function isSingleEmojiMessage(content) {
//   // 检查消息是否是表情URL
//   return content && (
//     (content.trim().startsWith('/static/emoji/') &&
//      (content.endsWith('.png') || content.endsWith('.webp') || content.endsWith('.gif')))
//     ||
//     // 检查是否是单个表情标签格式 [表情名]
//     (content.trim().match(/^\[.*\]$/) !== null)
//   );
// }

// 检查消息是否包含任何表情
// function containsEmojis(content) {
//   if (!content) return false;

//   // 检查是否包含表情标签 [表情名]
//   const emojiTagRegex = /\[[\w_\u4e00-\u9fa5]+\]/g;
//   return emojiTagRegex.test(content);
// }

// 解析包含表情的消息
const parsedMessage = computed(() => {
  if (!props.content) return [];
  // console.log('解析消息内容:', props.content, 'type:', props.type);

  // 如果是emoji类型，直接返回图片
  if (props.type === 'emoji') {
    return [{
      isEmoji: true,
      content: props.content
    }];
  }

  const result = [];
  const emojiTagRegex = /\[([\w_\u4e00-\u9fa5]+)\]/g;
  let lastIndex = 0;
  let match;
  let contentCopy = props.content;
  let matchFound = false;

  // 使用正则表达式查找所有表情标签
  while ((match = emojiTagRegex.exec(contentCopy)) !== null) {
    matchFound = true;
    // 添加表情前的文本（如果有）
    if (match.index > lastIndex) {
      result.push({
        isEmoji: false,
        content: contentCopy.substring(lastIndex, match.index)
      });
    }

    // 添加表情
    const emojiTag = match[0];
    const emojiName = match[1];
    // console.log('找到表情标签:', emojiTag, '表情名:', emojiName);
    
    // 构建表情URL
    let emojiUrl;
    
    // 首先检查是否在emoji.allEmoji中
    if (emoji.allEmoji && emoji.allEmoji[`[${emojiName}]`]) {
      emojiUrl = emoji.allEmoji[`[${emojiName}]`];
      // console.log('在emoji.allEmoji中找到表情:', emojiName, emojiUrl);
    } 
    // 处理tv_前缀的表情
    else if (emojiName.startsWith('tv_')) {
      const tvEmojiName = emojiName.substring(3); // 去掉tv_前缀
      emojiUrl = `/static/emoji/tv/${tvEmojiName}.webp`;
      // console.log('构建tv表情URL:', emojiUrl);
    }
    // 其他常见表情
    else {
      const commonEmojis = {
        '微笑': '/static/emoji/smile.webp',
        '狗头': '/static/emoji/goutou.webp',
        '口罩': '/static/emoji/kouzhao.webp',
        '睡着': '/static/emoji/tv/shuizhao.webp',
        'haixiu': '/static/emoji/tv/haixiu.webp'
      };
      
      if (commonEmojis[emojiName]) {
        emojiUrl = commonEmojis[emojiName];
        // console.log('在常见表情中找到表情:', emojiName, emojiUrl);
      } else {
        // 默认路径
        emojiUrl = `/static/emoji/${emojiName}.webp`;
        // console.log('使用默认表情路径:', emojiUrl);
      }
    }

    result.push({
      isEmoji: true,
      content: emojiUrl
    });

    lastIndex = match.index + emojiTag.length;
  }

  // 添加最后一个表情后的文本（如果有）
  if (lastIndex < contentCopy.length) {
    result.push({
      isEmoji: false,
      content: contentCopy.substring(lastIndex)
    });
  }

  // 如果没有找到表情标签，返回原始内容
  if (!matchFound) {
    return [{
      isEmoji: false,
      content: contentCopy
    }];
  }

  return result;
});



// 处理图片加载错误
function handleImageError(event) {
  const img = event.target;
  // 防止无限循环：检查当前src是否已经是占位符
  if (!img.src.includes('aixin.webp')) {
    img.src = '/static/emoji/aixin.webp'; // 替换为你的占位符图片路径
    img.alt = '表情加载失败';
  } else {
    // 如果已经是占位符但仍然失败，则移除src属性，只显示alt文本
    img.removeAttribute('src');
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  margin: 1.5rem 0;
  padding: 0 1rem;
}

.message-mine {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 1rem;
  border: 2px solid #e5e7eb;
  transition: border-color 0.3s ease;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.message-header {
  margin-bottom: 0.5rem;
}

.username {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
}

.time {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-left: 0.5rem;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: #f3f4f6;
  color: #1f2937;
  position: relative;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  max-width: 100%;
}

.bubble-mine {
  background-color: #3b82f6;
  color: white;
}

.emoji-image {
  max-width: 120px;
  max-height: 120px;
  display: block;
}

.emoji-image-inline {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin: 0 2px;
}

/* 添加气泡尖角 */
.message-bubble::before {
  content: '';
  position: absolute;
  top: 10px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

.message-bubble:not(.bubble-mine)::before {
  left: -16px;
  border-right-color: #f3f4f6;
}

.bubble-mine::before {
  right: -16px;
  border-left-color: #3b82f6;
}

.status-indicator {
  position: absolute;
  bottom: -20px;
  font-size: 0.8rem;
  color: #9ca3af;
}

.status-indicator.sending {
  color: #3b82f6;
}

.status-indicator.failed {
  color: #ef4444;
}
</style>
