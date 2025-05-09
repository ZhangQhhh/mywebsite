<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-title">
        <i class="fas fa-robot"></i>
        <span>AI小助手</span>
      </div>
      <div class="header-actions">
        <el-button type="text" @click="showSettings = true">
          <i class="fas fa-cog"></i> 设置
        </el-button>
        <el-button type="text" @click="clearChat">
          <i class="fas fa-trash"></i> 清空消息
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
          <!-- 用户消息直接显示 -->
          <div v-if="msg.type === 'user'" class="message-text">{{ msg.content }}</div>
          
          <!-- AI消息使用mavon-editor渲染Markdown -->
          <div v-else class="message-text markdown-content">
            <mavon-editor
              v-model="msg.content"
              :subfield="false"
              defaultOpen="preview"
              :toolbarsFlag="false"
              :editable="false"
              :scrollStyle="false"
              :ishljs="true"
              :navigation="false"
              class="ai-markdown-editor"
            />
          </div>
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
        <div class="model-selector">
          <el-checkbox v-model="useNetSearch" label="联网搜索"></el-checkbox>
        </div>
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="在这里输入哦..."
          @keyup.enter.prevent="handleSend"
        />
        <div class="action-buttons">
          <el-button type="primary" :disabled="!inputMessage.trim() || isTyping" @click="handleSend">
            发送吧
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 设置对话框 -->
    <el-dialog
      title="AI助手设置"
      v-model="showSettings"
      width="500px"
      :before-close="() => showSettings = false"
    >
      <div class="settings-content">
        <div class="form-item">
          <label>预设词 (System Prompt)</label>
          <el-input
            v-model="systemPrompt"
            type="textarea"
            :rows="5"
            placeholder="输入预设词，指导AI如何回答..."
          />
          <div class="form-help">预设词会影响AI的回答风格和内容。例如："你是一个专业的程序员，请用简洁的代码回答问题。"</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { MyDeepseek } from '@/api/chat'
import dayjs from 'dayjs'

export default {
  name: "ChatView",
  setup() {
    // 默认系统提示词
    const DEFAULT_SYSTEM_PROMPT = "你是一个专业、负责的小学英语老师，擅长回答小朋友们的各类问题。请用简洁明了的语言回答，必要时提供具体例子。如果不确定或不知道答案，请诚实说明，不要编造信息。"
    
    const inputMessage = ref('')
    const messages = ref([])
    const isTyping = ref(false)
    const chatBody = ref(null)
    const userAvatar = ref('https://avatars.githubusercontent.com/u/1?v=4')
    const aiAvatar = ref('public/favicon.png')
    const useNetSearch = ref(false)
    const systemPrompt = ref(DEFAULT_SYSTEM_PROMPT)
    const showSettings = ref(false)

    // 保存设置
    const saveSettings = () => {
      showSettings.value = false
      // 如果用户清空了提示词，恢复默认值
      if (!systemPrompt.value.trim()) {
        systemPrompt.value = DEFAULT_SYSTEM_PROMPT
      }
      // 保存到localStorage
      localStorage.setItem('chatSystemPrompt', systemPrompt.value)
    }

    // 重置为默认提示词
    const resetToDefault = () => {
      systemPrompt.value = DEFAULT_SYSTEM_PROMPT
    }

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
      // 不再需要在这里处理Markdown，因为我们使用mavon-editor渲染
      // 但我们可以在这里处理一些特殊的格式化需求
      return content;
    }

    // 处理流式响应的回调函数
    const handleStreamResponse = (chunk) => {
      // 如果是第一个响应块，创建AI消息
      if (!isTyping.value || messages.value.length === 0 || messages.value[messages.value.length - 1].type !== 'ai') {
        messages.value.push({
          type: 'ai',
          content: '',
          timestamp: new Date()
        })
      }
      
      // 更新最后一条AI消息的内容
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        lastMessage.content = chunk.fullContent
        scrollToBottom()
      }
      
      // 如果完成，更新状态
      if (chunk.done) {
        isTyping.value = false
      }
    }

    // 处理发送消息
    const handleSend = async () => {
      if (!inputMessage.value.trim() || isTyping.value) return

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
        // 使用系统提示词（如果为空则使用默认值）
        const promptToUse = systemPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT
        
        console.log(`发送问题到Deepseek AI: "${userMessage}"`)
        console.log(`联网搜索: ${useNetSearch.value ? '启用' : '禁用'}`)
        console.log(`使用系统提示词: "${promptToUse}"`)
        
        await MyDeepseek(userMessage, useNetSearch.value, handleStreamResponse, promptToUse)
        
      } catch (error) {
        isTyping.value = false
        console.error('发送消息失败:', error)
        
        // 添加错误消息
        messages.value.push({
          type: 'ai',
          content: `抱歉，发生了错误: ${error.message || '未知错误'}`,
          timestamp: new Date()
        })
        
        scrollToBottom()
      }
    }

    const clearChat = () => {
      messages.value = []
    }

    // 加载保存的设置
    onMounted(() => {
      // 从localStorage加载系统提示词，如果没有则使用默认值
      const savedPrompt = localStorage.getItem('chatSystemPrompt')
      if (savedPrompt) {
        systemPrompt.value = savedPrompt
      }
      scrollToBottom()
    })

    return {
      inputMessage,
      messages,
      isTyping,
      chatBody,
      userAvatar,
      aiAvatar,
      useNetSearch,
      systemPrompt,
      showSettings,
      handleSend,
      clearChat,
      formatTime,
      formatMessage,
      saveSettings,
      resetToDefault
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
  white-space: pre-wrap;
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
  flex-direction: column;
  gap: 12px;
}

.model-selector {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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

/* 设置对话框样式 */
.settings-content {
  padding: 10px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-help {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

/* Markdown编辑器样式 */
.markdown-content {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.ai-markdown-editor) {
  min-height: auto !important;
  max-height: none !important;
  box-shadow: none !important;
}

:deep(.ai-markdown-editor .v-note-wrapper) {
  min-height: auto !important;
  border: none !important;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ai-markdown-editor .v-note-panel) {
  border: none !important;
}

:deep(.ai-markdown-editor .v-note-show .v-show-content) {
  background-color: #fff !important;
  padding: 12px 16px !important;
  min-height: auto !important;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

:deep(.ai-markdown-editor .v-note-navigation-wrapper) {
  display: none !important;
}

/* 确保代码块正确显示 */
:deep(.ai-markdown-editor pre) {
  margin: 8px 0;
  border-radius: 6px;
}

:deep(.ai-markdown-editor code) {
  font-family: 'Courier New', Courier, monospace;
}

/* 调整表格样式 */
:deep(.ai-markdown-editor table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

:deep(.ai-markdown-editor th, .ai-markdown-editor td) {
  border: 1px solid #ddd;
  padding: 8px;
}

:deep(.ai-markdown-editor th) {
  background-color: #f2f2f2;
}
</style>
