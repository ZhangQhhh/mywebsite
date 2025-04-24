<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-title">
        <i class="fas fa-robot"></i>
        <span>AI助手</span>
      </div>
      <div class="header-actions">
        <el-button type="text" @click="clearChat">
          <i class="fas fa-trash"></i>
        </el-button>
      </div>
    </div>

    <!-- 聊天主体 -->
    <div class="chat-body" ref="chatBody">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message-wrapper', msg.type === 'user' ? 'user-message' : 'ai-message']">
        <div class="avatar">
          <img :src="msg.type === 'user' ? userAvatar : aiAvatar" :alt="msg.type">
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>
      <div v-if="isTyping" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 聊天输入框 -->
    <div class="chat-footer">
      <div class="input-wrapper">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="输入您的问题..."
          @keyup.enter="handleSend"
        />
        <div class="action-buttons">
          <el-button type="primary" :disabled="!inputMessage.trim()" @click="handleSend">
            发送 <i class="fas fa-paper-plane"></i>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { sendMessage, getChatHistory } from '@/api/chat'
import dayjs from 'dayjs'

export default {
  name: "ChatView",
  setup() {
    const inputMessage = ref('')
    const messages = ref([])
    const isTyping = ref(false)
    const chatBody = ref(null)
    const userAvatar = ref('https://avatars.githubusercontent.com/u/1?v=4')
    const aiAvatar = ref('/ai-avatar.png')

    const scrollToBottom = async () => {
      await nextTick()
      if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return dayjs(timestamp).format('HH:mm')
    }

    const formatMessage = (content) => {
      // 这里可以添加markdown渲染或其他格式化逻辑
      return content
    }

    const handleSend = async () => {
      if (!inputMessage.value.trim()) return

      // 添加用户消息
      messages.value.push({
        type: 'user',
        content: inputMessage.value,
        timestamp: new Date()
      })

      const userMessage = inputMessage.value
      inputMessage.value = ''
      scrollToBottom()

      // 显示AI正在输入状态
      isTyping.value = true

      try {
        const response = await sendMessage(userMessage)
        isTyping.value = false
        
        // 添加AI响应
        messages.value.push({
          type: 'ai',
          content: response.message,
          timestamp: new Date()
        })
        
        scrollToBottom()
      } catch (error) {
        isTyping.value = false
        // 处理错误
        console.error('发送消息失败:', error)
      }
    }

    const clearChat = () => {
      messages.value = []
    }

    onMounted(async () => {
      try {
        const history = await getChatHistory()
        messages.value = history.messages
        scrollToBottom()
      } catch (error) {
        console.error('获取历史记录失败:', error)
      }
    })

    return {
      inputMessage,
      messages,
      isTyping,
      chatBody,
      userAvatar,
      aiAvatar,
      handleSend,
      clearChat,
      formatTime,
      formatMessage
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 20px auto;
  height: 80vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f9f9f9;
}

.message-wrapper {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message-content {
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.user-message .message-text {
  background: #1890ff;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.chat-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
}

.input-wrapper {
  display: flex;
  gap: 12px;
}

.action-buttons {
  display: flex;
  align-items: flex-end;
}

.typing-indicator {
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  display: inline-flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
