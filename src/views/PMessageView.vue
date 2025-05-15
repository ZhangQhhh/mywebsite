<template>
  <Content>
    <div class="chat-container">
      <!-- 左侧聊天列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <div class="header-title">
            <h2>私信列表</h2>
            <span class="connection-status" :class="{ connected: wsConnected }">
              {{ wsConnected ? '已连接' : '未连接' }}
            </span>
          </div>
          <div>
            <el-button type="primary" size="small" @click="createNewChat">
              <i class="bi bi-plus-circle"></i> 新建会话
            </el-button>
            <el-button type="info" size="small" @click="loadChatList" title="刷新聊天列表">
              <i class="bi bi-arrow-clockwise"></i>
            </el-button>
            <el-button v-if="!wsConnected" type="warning" size="small" @click="resetWebSocketConnection" title="重置连接">
              <i class="bi bi-wifi"></i> 重连
            </el-button>
            <el-button type="info" size="small" @click="debugWebSocket" title="检查WebSocket">
              <i class="bi bi-bug"></i>
            </el-button>
          </div>
        </div>
        <div class="chat-list">
          <div v-for="chat in chatList" :key="chat.id" class="chat-item"
            :class="{ active: currentChat?.id === chat.id }" @click="selectChat(chat)">
            <div class="chat-avatar">
              <img :src="chat.avatar" :alt="chat.username">
              <span class="online-status" :class="{ 'is-online': chat.isOnline }"></span>
              <!-- 添加未读消息提示 -->
              <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}</span>
            </div>
            <div class="chat-info">
              <div class="chat-header">
                <span class="username">{{ chat.username }}</span>
                <span class="time">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              <p class="last-message">{{ chat.lastMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-main">
        <template v-if="currentChat">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="chat-user-info">
              <img :src="currentChat.avatar" :alt="currentChat.username">
              <div class="user-details">
                <h3>{{ currentChat.username }}</h3>
                <span class="status">{{ currentChat.isOnline ? '在线' : '迷失态' }}</span>
              </div>
            </div>
            <!-- 添加刷新按钮 -->
            <div class="header-actions">
              <el-button type="info" size="small" @click="refreshCurrentChat" title="刷新消息">
                <i class="bi bi-arrow-clockwise"></i> 刷新
              </el-button>
              <!-- <el-button type="primary" size="small" @click="testSound" title="测试提示音">
                <i class="bi bi-volume-up"></i> 测试提示音
              </el-button> -->
            </div>
          </div>

          <!-- 消息区域 -->
          <div class="messages-container" ref="messagesContainer">
            <div v-for="message in messages" :key="message.id" class="message-wrapper">
              <PMessage :is-mine="message.isMine" :username="message.username" :avatar="message.avatar"
                :content="message.content" :time="message.time" :type="message.type" />
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-container">
            <!-- 表情选择器 - 修改位置和样式 -->
            <div class="emoji-picker" v-show="showEmojiPicker">
              <!-- 添加表情分类标签页 -->
              <div class="emoji-tabs">
                <div class="emoji-tab" v-for="(tab, index) in ['常用', '表情', '经典', 'TV']" :key="index"
                  :class="{ active: activeEmojiTab === index }" @click="switchEmojiTab(index)">
                  {{ tab }}
                </div>
              </div>
              <!-- 表情网格 - 根据当前选中的标签页显示不同的表情 -->
              <div class="emoji-grid">
                <template v-if="activeEmojiTab === 0">
                  <!-- 常用表情 - Unicode表情 -->
                  <span
                    v-for="emoji in ['😀', '😂', '😊', '😍', '👍', '❤️', '🎉', '🔥', '😎', '🤔', '😢', '😡', '🥳', '😴', '🤗', '😇']"
                    :key="emoji" class="emoji-text" @click="selectEmoji(emoji)">
                    {{ emoji }}
                  </span>
                </template>
                <template v-else-if="activeEmojiTab === 1 && emoji && emoji.emojiList && emoji.emojiList[0]">
                  <!-- 表情包 - 第一组 -->
                  <template v-for="(item, index) in emoji.emojiList[0]" :key="index">
                    <span v-if="item.type === 'emoji'" class="emoji-text" @click="selectEmoji(item.label)">
                      {{ item.label }}
                    </span>
                    <img v-else-if="item.value" :src="item.value" class="emoji-item" alt="emoji"
                      @click="selectEmoji(item.value)">
                  </template>
                </template>
                <template v-else-if="activeEmojiTab === 2 && emoji && emoji.emojiList && emoji.emojiList[1]">
                  <!-- 经典表情 - 第二组 -->
                  <template v-for="(item, index) in emoji.emojiList[1]" :key="index">
                    <span v-if="item.type === 'emoji'" class="emoji-text" @click="selectEmoji(item.label)">
                      {{ item.label }}
                    </span>
                    <img v-else-if="item.value" :src="item.value" class="emoji-item" alt="emoji"
                      @click="selectEmoji(item.value)">
                  </template>
                </template>
                <template v-else-if="activeEmojiTab === 3 && emoji && emoji.emojiList && emoji.emojiList[2]">
                  <!-- TV表情 - 第三组 -->
                  <template v-for="(item, index) in emoji.emojiList[2]" :key="index">
                    <span v-if="item.type === 'emoji'" class="emoji-text" @click="selectEmoji(item.label)">
                      {{ item.label }}
                    </span>
                    <img v-else-if="item.value" :src="item.value" class="emoji-item" alt="emoji"
                      @click="selectEmoji(item.value)">
                  </template>
                </template>
              </div>
            </div>

            <div class="input-toolbar">
              <button class="toolbar-btn" @click="toggleEmojiPicker">
                <i class="bi bi-emoji-smile"></i>
              </button>
            </div>
            <div class="input-area">
              <textarea v-model="messageInput" @keyup.enter="sendMessage" placeholder="输入消息..." rows="1"></textarea>
              <button class="send-btn" @click="sendMessage">
                <i class="bi bi-send"></i>
              </button>
            </div>
          </div>
        </template>

        <!-- 未选择聊天时的提示 -->
        <div v-else class="no-chat-selected">
          <i class="bi bi-chat-dots"></i>
          <p>选择一个聊天开始对话</p>
        </div>
      </div>
    </div>
    
    <!-- 新建会话对话框 -->
    <el-dialog
      title="新建私信会话"
      v-model="showNewChatDialog"
      width="400px"
    >
      <el-form :model="newChatForm" label-width="80px">
        <el-form-item label="用户ID" required>
          <el-input v-model="newChatForm.userId" placeholder="请输入用户ID" type="number"></el-input>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="newChatForm.message"
            type="textarea"
            :rows="3"
            placeholder="请输入要发送的消息（可选）"
          ></el-input>
          <div class="form-tip" style="font-size: 12px; color: #909399; margin-top: 5px;">
            如不填写消息内容，系统将发送默认问候语
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewChatDialog = false">取消</el-button>
          <el-button type="primary" @click="submitNewChat" :loading="creating">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </Content>
</template>

<script>
/* eslint-disable */
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Content from '@/components/ContentBase';
import PMessage from '@/components/PMessage.vue'
import { getChatList, getChatMessages, markAsRead, MessageSent } from '@/api/PM'
import emoji from '@/assets/emoji.ts'
import dayjs from 'dayjs'
import store from '@/store'
import { showAlert } from '@/utils'
import { ElMessage } from 'element-plus'
import websocketService from '@/api/websocketService';
import { onMessageType } from '@/api/websocketService';

export default {
  name: 'PMessageView',
  components: {
    Content,
    PMessage
  },
  setup() {
    const route = useRoute()
    const messagesContainer = ref(null)
    const messageInput = ref('')
    const showEmojiPicker = ref(false)
    const currentChat = ref(null)
    const messages = ref([])
    const chatList = ref([])
    const emojiList = ref([])
    const loading = ref(false)
    const sending = ref(false)
    const activeEmojiTab = ref(0)
    const wsConnected = ref(false)
    const refreshInterval = ref(null)
    const socket = ref(null)
    const chatRefreshInterval = ref(null) // 添加这一行来定义变量
    
    // 添加重连相关变量
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3秒

    // 新增状态变量
    const showNewChatDialog = ref(false)
    const newChatForm = ref({
      userId: '',
      message: ''
    })
    const creating = ref(false)

    // 获取WebSocket URL
    const getWsUrl = () => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('token') || store.state.user?.token;
      if (!token) {
        // console.error('获取WebSocket URL失败: 未找到用户令牌');
        return null;
      }
      
      // 检查令牌格式是否正确
      if (!token.includes('.')) {
        // console.error('获取WebSocket URL失败: 令牌格式不正确');
        return null;
      }
      
      // 根据环境构建 WebSocket URL
      if (process.env.NODE_ENV === 'production') {
        // 生产环境
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${wsProtocol}//${host}/websocket/${token}`;
      } else {
        // 开发环境 - 确保添加 token
        return `ws://localhost:3000/websocket/${token}`;
      }
    };

    // 初始化WebSocket连接
    const initWebSocket = () => {
      // console.log('开始初始化WebSocket连接');
      
      // 如果已经有连接，先关闭
      if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
        // console.log('已有WebSocket连接，状态:', socket.value.readyState);
        return;
      }
      
      try {
        const wsUrl = getWsUrl();
        if (!wsUrl) {
          console.error('初始化WebSocket失败: 无法获取WebSocket URL');
          return;
        }
        
        // console.log('正在连接WebSocket:', wsUrl);
        socket.value = new WebSocket(wsUrl);
        
        // 连接打开事件
        socket.value.onopen = (event) => {
          // console.log('WebSocket连接已建立', event);
          wsConnected.value = true;
          
          // 可选：发送一个测试消息，验证连接是否正常工作
          // try {
          //   const testMessage = {
          //     type: 'ping',
          //     timestamp: new Date().toISOString()
          //   };
          //   socket.value.send(JSON.stringify(testMessage));
          //   // console.log('发送了ping测试消息');
          // } catch (error) {
          //   console.error('发送测试消息失败:', error);
          // }
        };
        
        // 接收消息事件 - 添加更详细的日志
        socket.value.onmessage = (event) => {
          // console.log('收到WebSocket消息');
          
          // 播放提示音
          playMessageSound();
          
          try {
            const data = JSON.parse(event.data);
            // console.log('解析后的WebSocket消息:', data);
            
            // 处理不同类型的消息
            if (data.type === 'message') {
              // console.log('收到聊天消息:', data);
              
              // 获取当前用户ID和发送者ID
              const currentUserId = store.state.user.id;
              const senderId = data.senderId;
              const senderIdStr = String(senderId);
              const currentUserIdStr = String(currentUserId);
              
              // console.log('当前用户ID:', currentUserIdStr, '发送者ID:', senderIdStr);
              
              // 判断消息是否是自己发送的
              const isMine = senderIdStr === currentUserIdStr;
              
              // 如果不是自己发送的消息，更新聊天列表中的未读计数
              if (!isMine) {
                // 查找发送者在聊天列表中的项
                const senderChat = chatList.value.find(chat => String(chat.id) === senderIdStr);
                if (senderChat) {
                  // 检查是否是当前聊天
                  const isCurrentChat = currentChat.value && String(currentChat.value.id) === senderIdStr;
                  
                  if (isCurrentChat) {
                    // 如果是当前聊天，立即进行局部刷新
                    // console.log('收到当前聊天的消息，立即刷新');
                    refreshCurrentChat();
                    
                    // 标记为已读
                    markAsRead(senderIdStr).catch(error => {
                      console.error('标记为已读失败:', error);
                    });
                  } else {
                    // 如果不是当前聊天，增加未读计数
                    senderChat.unreadCount = (senderChat.unreadCount || 0) + 1;
                    // 更新最后一条消息和时间
                    senderChat.lastMessage = data.content || '[新消息]';
                    senderChat.lastMessageTime = new Date();
                  }
                } else {
                  // 如果发送者不在聊天列表中，刷新整个列表
                  loadChatList();
                }
              } else {
                // 如果是自己发送的消息，检查是否需要刷新当前聊天
                const receiverId = data.receiverId;
                const receiverIdStr = String(receiverId);
                
                // 如果当前正在与接收者聊天，刷新聊天界面
                if (currentChat.value && String(currentChat.value.id) === receiverIdStr) {
                  // console.log('收到自己发送给当前聊天对象的消息确认，立即刷新');
                  refreshCurrentChat();
                }
              }
            } else if (data.type === 'unreadCount') {
              // console.log('收到未读消息计数:', data.count);
              // 刷新聊天列表以获取最新的未读计数
              loadChatList();
            } else if (data.type === 'confirm') {
              // console.log('收到消息确认:', data);
              
              // 如果是当前聊天的消息确认，刷新聊天界面
              if (currentChat.value && data.receiverId && String(data.receiverId) === String(currentChat.value.id)) {
                // console.log('收到当前聊天的消息确认，立即刷新');
                refreshCurrentChat();
              }
            } else {
              // 其他类型消息处理...
              // console.log('收到其他类型消息:', data);
            }
          } catch (error) {
            // console.error('解析WebSocket消息失败:', error);
            // console.error('原始消息内容:', event.data);
          }
        };
        
        // 连接关闭事件
        socket.value.onclose = (event) => {
          // console.log('WebSocket连接已关闭:', event);
          // console.log('关闭代码:', event.code);
          // console.log('关闭原因:', event.reason);
          // console.log('是否干净关闭:', event.wasClean);
          
          wsConnected.value = false;
          
          // 尝试重连
          setTimeout(() => {
            // console.log('尝试重新连接WebSocket');
            initWebSocket();
          }, 3000);
        };
        
        // 连接错误事件
        socket.value.onerror = (error) => {
          // console.error('WebSocket连接错误:', error);
          wsConnected.value = false;
        };
        
        return true;
      } catch (error) {
        wsConnected.value = false;
        return false;
      }
    };

    // 关闭WebSocket连接
    const closeWebSocket = () => {
      if (socket.value) {
        socket.value.close()
        socket.value = null
      }
      wsConnected.value = false
    }

    // 发送WebSocket消息
    const sendWebSocketMessage = (data) => {
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        return false
      }
      
      try {
        socket.value.send(JSON.stringify(data))
        return true
      } catch (error) {
        return false
      }
    }

    // 优化处理新消息的函数
    const handleNewMessage = (data) => {
      
      // 检查消息格式
      if (!data || (!data.message && !data.content)) {
        // console.error('消息数据格式不正确:', data);
        return;
      }
      
      // 适应不同的消息格式
      const message = data.message || data;
      const senderId = message.senderId || data.senderId;
      const senderIdStr = String(senderId);
      const messageContent = message.content || '';
      const messageType = message.type || 'text';
      
      // 确定消息是否是自己发送的
      const currentUserId = String(store.state.user.id);
      const isMine = senderIdStr === currentUserId;
      
      // console.log('消息详情 - 发送者ID:', senderIdStr, '当前用户ID:', currentUserId, '是否自己发送:', isMine);
      
      // 创建新消息对象
      const newMessage = {
        id: message.id || `msg-${Date.now()}`,
        content: messageContent,
        username: message.senderName || (isMine ? store.state.user.username : currentChat.value?.username || '对方'),
        avatar: message.senderAvatar || (isMine ? userAvatar.value : currentChat.value?.avatar || require('@/assets/mylogo.png')),
        time: new Date(message.createTime || message.timestamp || new Date()),
        isMine: isMine,
        type: messageType,
        isRead: message.isRead
      };
      
      // 检查是否是当前聊天
      const receiverId = message.receiverId || data.receiverId;
      const isCurrentChat = currentChat.value && (
        (isMine && receiverId && String(currentChat.value.id) === String(receiverId)) || 
        (!isMine && String(currentChat.value.id) === senderIdStr)
      );
      
      // console.log('是否当前聊天:', isCurrentChat, '当前聊天ID:', currentChat.value?.id);
      
      if (isCurrentChat) {
        // 添加到消息列表
        messages.value.push(newMessage);
        
        // 更新会话缓存
        try {
          sessionStorage.setItem(`chat_${currentChat.value.id}`, JSON.stringify(messages.value));
        } catch (error) {
          // console.error('更新会话缓存失败:', error);
        }
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
        
        // 如果是收到的消息，标记为已读
        if (!isMine) {
          markAsRead(currentChat.value.id).catch(error => {
            // console.error('标记为已读失败:', error);
          });
        }
      } else {
        // 不是当前聊天，更新聊天列表
        loadChatList();
        
        // 如果是收到的消息，显示通知
        if (!isMine) {
          // 查找发送者信息
          const sender = chatList.value.find(c => String(c.id) === senderIdStr);
          const senderName = sender?.username || '有人';
          
          // 显示系统通知
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              try {
                const notificationOptions = {
                  body: messageType === 'emoji' ? '[表情]' : messageContent,
                  icon: sender?.avatar || require('@/assets/mylogo.png'),
                  tag: `chat-${senderIdStr}`, // 使用标签避免重复通知
                  requireInteraction: true // 通知保持显示直到用户交互
                };
                
                const notification = new Notification(`来自 ${senderName} 的新消息`, notificationOptions);
                
                // 确保通知点击事件正常工作
                notification.onclick = () => {
                  window.focus();
                  if (sender) {
                    selectChat(sender);
                  }
                };
                
                // console.log('系统通知已创建:', notification);
              } catch (error) {
                // console.error('创建系统通知失败:', error);
              }
            } else if (Notification.permission !== 'denied') {
              // 如果权限状态是 'default'，请求权限
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  // 权限获取后重新尝试显示通知
                  const notification = new Notification(`来自 ${senderName} 的新消息`, {
                    body: messageType === 'emoji' ? '[表情]' : messageContent,
                    icon: sender?.avatar || require('@/assets/mylogo.png')
                  });
                  
                  notification.onclick = () => {
                    window.focus();
                    if (sender) {
                      selectChat(sender);
                    }
                  };
                }
              });
            }
          }
          
          // 播放提示音
          playMessageSound();
        }
      }
    };

    // 检查WebSocket连接状态
    const checkWebSocketConnection = () => {
      // console.log('检查WebSocket连接状态');
      
      if (!socket.value) {
        // console.error('WebSocket对象不存在');
        return false;
      }
      
      const stateMap = {
        0: 'CONNECTING',
        1: 'OPEN',
        2: 'CLOSING',
        3: 'CLOSED'
      };
      
      // console.log('WebSocket状态:', socket.value.readyState, stateMap[socket.value.readyState]);
      
      if (socket.value.readyState === WebSocket.OPEN) {
        // console.log('WebSocket连接正常');
        return true;
      } else {
        console.error('WebSocket未连接');
        return false;
      }
    };

    // 选择表情
    const selectEmoji = (emojiUrl) => {
      // 检查是否是Unicode表情或表情URL
      if (typeof emojiUrl === 'string') {
        // 如果是Unicode表情（不包含/）或完整URL
        if (!emojiUrl.includes('/') || emojiUrl.startsWith('http')) {
          // Unicode表情直接添加
          messageInput.value += emojiUrl;
        } else {
          // 如果是图片表情，使用特殊标记 [emoji:path] 格式
          // 从emoji对象中查找标签
          const emojiLabel = Object.keys(emoji.allEmoji).find(key => emoji.allEmoji[key] === emojiUrl);
          if (emojiLabel) {
            // 使用标签作为表情标识符
            messageInput.value += emojiLabel;
          } else {
            // 如果找不到标签，使用路径的最后部分作为标识符
            const pathParts = emojiUrl.split('/');
            const filename = pathParts[pathParts.length - 1].split('.')[0];
            messageInput.value += `[${filename}]`;
          }
        }
      }

      showEmojiPicker.value = false;

      // 聚焦输入框
      nextTick(() => {
        const inputEl = document.querySelector('.input-area textarea');
        if (inputEl) {
          inputEl.focus();
        }
      });
    }

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value;
    }

    // 切换表情包标签页
    const switchEmojiTab = (index) => {
      activeEmojiTab.value = index;
    }

    // 加载聊天列表
    const loadChatList = async () => {
      loading.value = true;
      try {
        const response = await getChatList();

        if (response && response.data.conversations
          && Array.isArray(response.data.conversations
          )) {
          chatList.value = response.data.conversations
            .map(chat => {
              return {
                id: chat.contact_id,
                username: chat.contact_name || '未知用户',
                avatar: chat.contact_avatar || require('@/assets/mylogo.png'),
                lastMessage: chat.last_message || '',
                lastMessageTime: chat.last_time ? new Date(chat.last_time) : new Date(),
                isOnline: chat.isOnline || false,
                unreadCount: chat.unread_count || 0  // 确保正确获取未读消息计数
              };
            });

          // 如果当前有选中的聊天，更新其头像和未读计数
          if (currentChat.value) {
            const updatedChat = chatList.value.find(chat => chat.id === currentChat.value.id);
            if (updatedChat) {
              currentChat.value.avatar = updatedChat.avatar;
              // 如果当前聊天有未读消息，标记为已读
              if (updatedChat.unreadCount > 0) {
                markAsRead(currentChat.value.id).catch(error => {
                  console.error('标记为已读失败:', error);
                });
              }
            }
          }
        } else {
          console.warn('API返回的数据格式不符合预期:', response);
          chatList.value = []; // 返回空列表而不是模拟数据
        }
      } catch (error) {
        console.error('加载聊天列表失败:', error);
        showAlert('加载聊天列表失败，请稍后重试');
        chatList.value = []; // 错误时返回空列表
      } finally {
        loading.value = false;
      }
    }

    // 加载消息历史
    const loadMessages = async (chatId) => {
      if (!chatId) return

      loading.value = true
      try {
        // 尝试从缓存加载
        const cachedMessages = sessionStorage.getItem(`chat_${chatId}`)
        if (cachedMessages) {
          messages.value = JSON.parse(cachedMessages)
        }

        // 从服务器获取最新消息
        const response = await getChatMessages(chatId)

        // 检查响应格式并处理数据
        if (response && response.success && response.data) {
          // 根据后端返回的实际结构获取消息数组
          const messageData = response.data.records || [];

          if (Array.isArray(messageData) && messageData.length > 0) {
            messages.value = formatMessages(messageData);
            // 更新缓存
            sessionStorage.setItem(`chat_${chatId}`, JSON.stringify(messages.value));
          } else {
           
            messages.value = [];
          }
        } else {
          console.error('响应格式不符合预期:', response);
          // 如果没有缓存数据，则设置为空数组
          if (!cachedMessages) {
            messages.value = [];
          }
        }

        // 滚动到底部
        nextTick(scrollToBottom);
      } catch (error) {
        console.error(`加载与用户 ${chatId} 的消息历史失败:`, error);
        // 如果出错且没有缓存数据，则设置为空数组
        if (!sessionStorage.getItem(`chat_${chatId}`)) {
          messages.value = [];
        }
      } finally {
        loading.value = false;
      }
    };

    // 格式化消息列表
    const formatMessages = (messageList) => {
      if (!Array.isArray(messageList)) {
        console.error('formatMessages: messageList不是数组', messageList);
        return [];
      }

      const currentUserId = store.state.user.id;

      // 按照时间排序消息（从旧到新）
      const sortedMessages = [...messageList].sort((a, b) => {
        const timeA = new Date(a.createTime || a.timestamp || 0);
        const timeB = new Date(b.createTime || b.timestamp || 0);
        return timeA - timeB;
      });

      return sortedMessages.map(msg => ({
        id: msg.id,
        content: msg.content || '',
        username: String(msg.senderId) === String(currentUserId) ? store.state.user.username : currentChat.value.username,
        avatar: String(msg.senderId) === String(currentUserId) ? userAvatar.value : currentChat.value.avatar,
        time: new Date(msg.createTime || msg.timestamp || new Date()),
        isMine: String(msg.senderId) === String(currentUserId),
        type: msg.type || 'text',
        isRead: msg.isRead
      }));
    };

    // 选择聊天
    const selectChat = async (chat) => {
      if (!chat) return;

      // 确保聊天对象有有效的头像
      if (!chat.avatar || chat.avatar === 'undefined' || chat.avatar === 'null') {
        chat.avatar = require('@/assets/mylogo.png');
      }

      // 如果有未读消息，标记为已读
      if (chat.unreadCount > 0) {
        try {
          await markAsRead(chat.id);
          // 更新本地未读计数
          chat.unreadCount = 0;
        } catch (error) {
          console.error('标记为已读失败:', error);
        }
      }

      currentChat.value = chat;
      await loadMessages(chat.id);
      scrollToBottom();

      // 更新URL，但不重新加载页面
      const currentRoute = route.path.split('/')[1];
      window.history.pushState(
        {},
        '',
        `/${currentRoute}/${chat.id}`
      );

      // 设置自动刷新当前聊天
      if (chatRefreshInterval.value) {
        clearInterval(chatRefreshInterval.value);
      }
      
      // 每15秒自动刷新一次当前聊天
      chatRefreshInterval.value = setInterval(() => {
        if (currentChat.value && currentChat.value.id === chat.id) {
          // console.log('自动刷新当前聊天');
          refreshCurrentChat();
        }
      }, 15000);
    }

    // 检查消息是否包含表情
    const checkMessageForEmojis = (message) => {
      

      // 检查是否是纯表情消息 - 完全匹配 [表情名]
      const singleEmojiMatch = message.trim().match(/^\[([\w_\u4e00-\u9fa5]+)\]$/);
      if (singleEmojiMatch) {
        const emojiTag = message.trim();
        const emojiName = singleEmojiMatch[1];
      

        // 构建表情URL
        let emojiUrl;

        // 首先检查是否在emoji.allEmoji中
        if (emoji.allEmoji && emoji.allEmoji[emojiTag]) {
          emojiUrl = emoji.allEmoji[emojiTag];
          
        }
        // 处理tv_前缀的表情
        else if (emojiName.startsWith('tv_')) {
          const tvEmojiName = emojiName.substring(3); // 去掉tv_前缀
          emojiUrl = `/static/emoji/tv/${tvEmojiName}.webp`;
         
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
            
          } else {
            // 默认路径
            emojiUrl = `/static/emoji/${emojiName}.webp`;
            
          }
        }

        return {
          content: emojiUrl,
          type: 'emoji'
        };
      }

      // 如果不是纯表情，保持原始内容
      return {
        content: message,
        type: 'text'
      };
    };

    // 优化发送消息函数
    const sendMessage = async () => {
      if (!messageInput.value.trim() || sending.value || !currentChat.value) {
        return;
      }

      // 检查WebSocket连接状态
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        console.error('WebSocket未连接，尝试重新连接');
        const connected = initWebSocket();
        if (!connected) {
          showAlert('网络连接不稳定，请稍后重试');
          return;
        }
      }

      const content = messageInput.value.trim();
      messageInput.value = '';
      sending.value = true;

      // 定义tempId在函数顶部，确保在整个函数作用域内可用
      const tempId = 'temp-' + Date.now();

      try {
        // 检查消息是否包含表情
        const messageData = checkMessageForEmojis(content);
        
        // 先添加到本地消息列表（乐观UI更新）
        const newMessage = {
          id: tempId,
          content: messageData.content,
          username: store.state.user.username || '我',
          avatar: store.state.user.photo || require('@/assets/mylogo.png'),
          time: new Date(),
          isMine: true,
          type: messageData.type,
          sending: true // 标记为发送中
        };

        // 添加到消息列表
        messages.value.push(newMessage);
        scrollToBottom();

        // 通过WebSocket发送消息
        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
          // 构造符合后端期望的消息格式
          const wsMessage = {
            receiverId: parseInt(currentChat.value.id),
            content: content
          };
          
          socket.value.send(JSON.stringify(wsMessage));
          
          // 不立即标记为已发送，等待服务器确认
        } else {
          // 如果WebSocket不可用，回退到HTTP API
          const response = await MessageSent(currentChat.value.id, content);
          
          // 更新消息状态
          updateMessageStatus(tempId, response);
        }
      } catch (error) {
        showAlert('发送消息失败，请稍后重试');

        // 标记消息为发送失败
        const index = messages.value.findIndex(m => m.id === tempId);
        if (index !== -1) {
          messages.value[index].sending = false;
          messages.value[index].failed = true;
        }
      } finally {
        sending.value = false;
      }
    };

    // 添加一个函数来更新消息状态
    const updateMessageStatus = (tempId, response) => {
      const index = messages.value.findIndex(m => m.id === tempId);
      if (index !== -1) {
        if (response && response.data && response.data.message) {
          // 用服务器返回的消息ID替换临时ID
          messages.value[index].id = response.data.message.id;
          messages.value[index].sending = false;

          // 保存到会话缓存
          if (currentChat.value) {
            try {
              sessionStorage.setItem(`chat_${currentChat.value.id}`, JSON.stringify(messages.value));
            } catch (error) {
              console.error('更新会话缓存失败:', error);
            }
          }
        } else {
          // 仅标记为已发送
          messages.value[index].sending = false;
        }
      }
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    }

    const formatTime = (time) => {
      if (!time) return '';

      const now = dayjs();
      const messageTime = dayjs(time);

      // 如果是今天的消息，只显示时间
      if (now.isSame(messageTime, 'day')) {
        return messageTime.format('HH:mm');
      }

      // 如果是昨天的消息，显示"昨天 时间"
      if (now.subtract(1, 'day').isSame(messageTime, 'day')) {
        return `昨天 ${messageTime.format('HH:mm')}`;
      }

      // 如果是今年的消息，显示"月-日 时间"
      if (now.isSame(messageTime, 'year')) {
        return messageTime.format('MM-DD HH:mm');
      }

      // 其他情况显示完整日期
      return messageTime.format('YYYY-MM-DD HH:mm');
    }

    // 监听路由参数变化
    watch(() => route.params.chatId, (newId) => {
      if (newId) {
        const chat = chatList.value.find(c => c.id === newId);
        if (chat) {
          selectChat(chat);
        }
      }
    });

    // 组件挂载时初始化数据
    const setupWebSocketHandlers = () => {
      // console.log('【设置】注册WebSocket消息处理函数');
      
      // 注册消息处理函数
      const messageHandler = (data) => {
        // console.log('【WebSocket服务】收到message类型消息:', data);
        
        // 获取当前用户ID
        const currentUserId = store.state.user.id;
        
        // 检查是否是自己发送的消息
        const isMine = String(data.senderId) === String(currentUserId);
        // console.log('【WebSocket服务】是否是自己发送的消息:', isMine);
        
        // 如果不是自己发送的，播放提示音
        if (!isMine) {
          // console.log('【WebSocket服务】收到他人消息，播放提示音');
          playMessageSound();
        }
        
        // 其他处理逻辑...
      };
      
      // 注册到websocketService
      const removeHandler = onMessageType('message', messageHandler);
      
      // 在组件卸载时移除处理函数
      onUnmounted(() => {
        // console.log('【设置】移除WebSocket消息处理函数');
        removeHandler();
      });
    };

    // 添加一个标志，表示页面是否刚刚加载
    const isPageJustLoaded = ref(true);

    onMounted(async () => {
      // 标记页面刚刚加载
      isPageJustLoaded.value = true;
      
      // 3秒后重置标志
      setTimeout(() => {
        isPageJustLoaded.value = false;
      }, 3000);
      
      // 请求通知权限
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // 预加载音频
      try {
        const audio = new Audio(require('@/assets/sound/message.mp3'));
        audio.load();
        // console.log('音频文件预加载成功');
      } catch (error) {
        console.error('音频文件预加载失败:', error);
      }
      
      // 加载聊天列表
      // console.log('加载聊天列表');
      await loadChatList();
      
      // 初始化WebSocket连接
      // console.log('初始化WebSocket连接');
      initWebSocket();
      
      // 设置WebSocket消息处理函数
      setupWebSocketHandlers();
      
      // 检查路由参数
      if (route.params.chatId) {
        // console.log('从路由参数加载聊天:', route.params.chatId);
        const chat = chatList.value.find(c => String(c.id) === String(route.params.chatId));
        if (chat) {
          selectChat(chat);
        }
      }
      
      // 设置定时检查WebSocket连接状态
      refreshInterval.value = setInterval(() => {
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
          if (reconnectAttempts < maxReconnectAttempts) {
            // console.log('WebSocket未连接或已关闭，尝试重新连接');
            initWebSocket();
          } else {
            // console.log('已达到最大重连次数，不再自动重连');
          }
        }
      }, 30000); // 30秒检查一次
    });

    // 组件卸载时清理
    onUnmounted(() => {
      // console.log('PMessageView组件已卸载');
      
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
      
      // 关闭WebSocket连接
      if (socket.value) {
        socket.value.close();
        socket.value = null;
      }

      if (chatRefreshInterval.value) {
        clearInterval(chatRefreshInterval.value);
        chatRefreshInterval.value = null;
      }
    });

    const userAvatar = computed(() => {
      return store.state.user.photo || require('@/assets/mylogo.png');
    });

    // 搜索用户
    // const searchUsers = async (query, callback) => {
    //   console.log('搜索用户:', query);
    //   if (query.length < 1) {
    //     callback([]);
    //     return;
    //   }

    //   try {
    //     const response = await searchUsersByName(query);
    //     console.log('搜索结果:', response);
    //     if (response.success && Array.isArray(response.data)) {
    //       // 过滤掉当前用户自己
    //       const users = response.data.filter(user =>
    //         String(user.id) !== String(store.state.user.id)
    //       );
    //       callback(users);
    //     } else {
    //       callback([]);
    //     }
    //   } catch (error) {
    //     console.error('搜索用户失败:', error);
    //     callback([]);
    //   }
    // };

    // 选择用户
    const handleUserSelect = (user) => {
      console.log('选择用户:', user);
      newChatForm.value.userId = user.id;
      newChatForm.value.avatar = user.avatar || require('@/assets/mylogo.png');
    };

    // 创建新会话
    const createNewChat = () => {
      console.log('创建新会话按钮被点击');
      showNewChatDialog.value = true;
      // 重置表单
      newChatForm.value = {
        userId: '',
        message: ''
      };
    };

    // 提交新会话
    const submitNewChat = async () => {
      // 表单验证 - 只验证用户ID
      if (!newChatForm.value.userId) {
        ElMessage.warning('请输入用户ID');
        return;
      }

      creating.value = true;

      try {
        // 如果消息内容为空，使用默认消息或直接创建空会话
        const messageContent = newChatForm.value.message.trim() || '你好，我想和你聊天';
        
        // 发送第一条消息
        const response = await MessageSent(
          newChatForm.value.userId, 
          messageContent
        );
        
        console.log('创建新会话响应:', response);

        if (response && response.success) {
          ElMessage.success('会话创建成功');
          
          // 重新加载聊天列表
          await loadChatList();

          // 查找新创建的聊天
          const newChat = chatList.value.find(chat => 
            String(chat.id) === String(newChatForm.value.userId)
          );

          if (newChat) {
            // 选择新创建的聊天
            selectChat(newChat);
          } else {
            console.warn('未在聊天列表中找到新创建的聊天');
          }

          // 关闭对话框
          showNewChatDialog.value = false;
        } else {
          throw new Error(response?.error_msg || '创建会话失败');
        }
      } catch (error) {
        console.error('创建新会话失败:', error);
        ElMessage.error('创建会话失败: ' + (error.message || '未知错误'));
      } finally {
        creating.value = false;
      }
    };

    // 重连WebSocket
    const reconnectWebSocket = () => {
      console.log('手动重连WebSocket');
      websocketService.closeWebSocket();
      setTimeout(() => {
        websocketService.initWebSocket(getWsUrl());
      }, 500);
    };

    // 添加一个测试函数，用于手动发送测试消息
    const sendTestMessage = () => {
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        console.error('WebSocket未连接，无法发送测试消息');
        return;
      }
      
      try {
        const testMessage = {
          type: 'test',
          content: 'This is a test message',
          timestamp: new Date().toISOString()
        };
        
        console.log('发送测试消息:', testMessage);
        socket.value.send(JSON.stringify(testMessage));
        console.log('测试消息已发送');
      } catch (error) {
        console.error('发送测试消息失败:', error);
      }
    };

    // 添加一个函数，用于检查WebSocket是否正常工作
    const checkWebSocketHealth = () => {
      console.log('检查WebSocket健康状态');
      
      if (!socket.value) {
        console.error('WebSocket对象不存在');
        return false;
      }
      
      console.log('WebSocket状态:', socket.value.readyState);
      console.log('WebSocket连接状态映射:', {
        0: 'CONNECTING',
        1: 'OPEN',
        2: 'CLOSING',
        3: 'CLOSED'
      }[socket.value.readyState]);
      
      if (socket.value.readyState === WebSocket.OPEN) {
        console.log('WebSocket连接正常');
        
        // 检查事件处理函数是否已设置
        console.log('onmessage处理函数已设置:', !!socket.value.onmessage);
        console.log('onclose处理函数已设置:', !!socket.value.onclose);
        console.log('onerror处理函数已设置:', !!socket.value.onerror);
        
        return true;
      } else {
        console.error('WebSocket连接异常');
        return false;
      }
    };

    // 处理调试命令
    const handleDebugCommand = (command) => {
      console.log('执行调试命令:', command);
      
      switch (command) {
        case 'checkHealth':
          checkWebSocketHealth();
          break;
        case 'sendTest':
          sendTestMessage();
          break;
        case 'reconnect':
          closeWebSocket();
          setTimeout(() => {
            initWebSocket();
          }, 500);
          break;
        default:
          console.error('未知调试命令:', command);
      }
    };

    // 添加消息提示音功能
    // 检查音频文件是否存在
    const checkAudioFile = () => {
      try {
        const audioPath = require('@/assets/sound/message.mp3');
        console.log('音频文件路径:', audioPath);
        return true;
      } catch (error) {
        console.error('音频文件不存在:', error);
        return false;
      }
    };

    // 创建一个全局音频对象，避免每次都创建新的
    const messageAudio = ref(null);

    // 在组件挂载时初始化音频对象
    onMounted(async () => {
      // 初始化音频对象，但完全禁止自动播放
      try {
        // 创建音频对象但设置音量为0并禁用自动播放
        messageAudio.value = new Audio();
        messageAudio.value.src = require('@/assets/sound/message.mp3');
        messageAudio.value.volume = 0; // 设置音量为0
        messageAudio.value.autoplay = false; // 明确禁用自动播放
        messageAudio.value.muted = true; // 静音
        messageAudio.value.load();
        
        // 只使用预加载属性，不调用play()方法
        messageAudio.value.preload = 'auto';
      } catch (error) {
        console.error('初始化音频对象失败:', error);
      }
      
      // 先加载聊天列表，再初始化WebSocket
      // 这样可以避免在加载过程中收到消息触发声音
      await loadChatList();
      
      // 延迟初始化WebSocket，避免立即收到消息
      setTimeout(() => {
        initWebSocket();
        setupWebSocketHandlers();
      }, 1000);
      
      // 检查路由参数
      if (route.params.chatId) {
        const chat = chatList.value.find(c => String(c.id) === String(route.params.chatId));
        if (chat) {
          selectChat(chat);
        }
      }
    });

    // 修改播放消息提示音函数
    const playMessageSound = () => {
      // 如果页面刚刚加载，不播放声音
      if (isPageJustLoaded.value) {
        console.log('页面刚加载，跳过提示音');
        return;
      }
      
      try {
        const audio = new Audio(require('@/assets/sound/message.mp3'));
        audio.volume = 0.5;
        audio.play()
          .then()
          .catch(error => {
            console.error('消息提示音播放失败:', error);
          });
      } catch (error) {
        console.error('播放音频失败:', error);
      }
    };

    // 添加重置WebSocket连接的函数
    const resetWebSocketConnection = () => {
      // console.log('手动重置WebSocket连接');
      
      // 关闭现有连接
      if (socket.value) {
        socket.value.close();
        socket.value = null;
      }
      
      // 重置重连计数
      reconnectAttempts = 0;
      wsConnected.value = false;
      
      // 延迟1秒后重新连接
      setTimeout(() => {
        initWebSocket();
      }, 1000);
    };

    // 添加调试WebSocket的函数
    const debugWebSocket = () => {
      // console.log('调试WebSocket连接');
      
      // 检查WebSocket状态
      const status = checkWebSocketConnection();
      ElMessage.info(`您的连接状态: ${status ? '正常' : '异常'}`);
      
      if (!status) {
        // 提示用户
        ElMessage.warning('连接异常，尝试重新连接');
        // 尝试重新连接
        resetWebSocketConnection();
      }
    };

    // 添加一个局部刷新函数
    const refreshCurrentChat = async () => {
      if (!currentChat.value) return false;
      
      // console.log('刷新当前聊天:', currentChat.value.id);
      
      try {
        // 1. 刷新聊天列表
        await loadChatList();
        
        // 2. 重新加载当前聊天的消息
        const chatId = currentChat.value.id;
        
        // 从服务器获取最新消息
        const response = await getChatMessages(chatId);
        
        // 检查响应格式并处理数据
        if (response && response.success && response.data) {
          // 根据后端返回的实际结构获取消息数组
          const messageData = response.data.records || [];
          
          if (Array.isArray(messageData) && messageData.length > 0) {
            // 保存当前滚动位置
            const scrollPosition = messagesContainer.value ? messagesContainer.value.scrollTop : 0;
            const isAtBottom = messagesContainer.value ? 
              (messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop <= messagesContainer.value.clientHeight + 50) : 
              true;
            
            messages.value = formatMessages(messageData);
            
            // 更新缓存
            sessionStorage.setItem(`chat_${chatId}`, JSON.stringify(messages.value));
            // console.log('成功更新消息列表，消息数量:', messages.value.length);
            
            // 恢复滚动位置或滚动到底部
            nextTick(() => {
              if (messagesContainer.value) {
                if (isAtBottom) {
                  scrollToBottom();
                } else {
                  messagesContainer.value.scrollTop = scrollPosition;
                }
              }
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error('局部刷新失败:', error);
        return false;
      }
    };

    const testSound = () => {
      // console.log('测试提示音');
      playMessageSound();
    };

    return {
      currentChat,
      messages,
      chatList,
      emojiList,
      showEmojiPicker,
      messageInput,
      messagesContainer,
      activeEmojiTab,
      selectChat,
      sendMessage,
      selectEmoji,
      toggleEmojiPicker,
      formatTime,
      loading,
      sending,
      switchEmojiTab,
      emoji, // 导出emoji对象以便在模板中使用
      wsConnected,
      userAvatar,
      showNewChatDialog,
      newChatForm,
      creating,
      handleUserSelect,
      createNewChat,
      submitNewChat,
      reconnectWebSocket,
      sendTestMessage,
      checkWebSocketHealth,
      handleDebugCommand,
      playMessageSound,
      resetWebSocketConnection,
      debugWebSocket,
      updateMessageStatus,
      checkWebSocketConnection,
      refreshCurrentChat,
      testSound,
      loadChatList
    };
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 64px);
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.chat-sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e5e7eb;
}

.chat-item:hover {
  background: #f3f4f6;
}

.chat-item.active {
  background: #eef2ff;
}

.chat-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 1rem;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

/* 未读消息提示样式 */
.unread-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #f56c6c;
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  transform: translate(25%, 25%);
  z-index: 2;
}

/* 调整在线状态指示器的位置，避免与未读消息提示重叠 */
.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
  border: 2px solid #ffffff;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.online-status.is-online {
  background: #10b981;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.username {
  font-weight: 600;
  color: #1f2937;
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.last-message {
  color: #6b7280;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}

.user-details h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.status {
  font-size: 0.875rem;
  color: #6b7280;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  background: #f9fafb;
}

.input-container {
  padding: 1rem;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 300px;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 1000;
}

/* 表情标签页 */
.emoji-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
}

.emoji-tab {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.emoji-tab.active {
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
}

.emoji-tab:hover {
  background: #f9fafb;
}

/* 表情网格 */
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
}

/* 表情项 */
.emoji-text {
  font-size: 1.5rem;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease;
}

.emoji-text:hover {
  transform: scale(1.2);
}

.emoji-item {
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: transform 0.2s ease;
  object-fit: contain;
}

.emoji-item:hover {
  transform: scale(1.1);
}

/* 输入工具栏 */
.input-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
}

.toolbar-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.toolbar-btn:hover {
  color: #4f46e5;
}

/* 输入区域 */
.input-container {
  position: relative;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.input-area {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 1.5rem;
  padding: 0.5rem 1rem;
}

.input-area textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  padding: 0.5rem;
  font-size: 1rem;
  max-height: 100px;
  overflow-y: auto;
}

.send-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.no-chat-selected i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* 新增样式 */
.user-suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.new-chat-form {
  padding: 10px;
}

/* 添加到现有样式中 */
.connection-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  background-color: #f56c6c;
  color: white;
}

.connection-status.connected {
  background-color: #67c23a;
}

/* 消息发送状态样式 */
.message-status {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.message-failed {
  color: #f56c6c;
}

/* 消息重试按钮 */
.retry-btn {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
  margin-left: 5px;
}

.retry-btn:hover {
  text-decoration: underline;
}

/* 添加样式 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .chat-sidebar {
    width: 100%;
    height: 40vh;
  }

  .chat-main {
    height: 60vh;
  }
}
</style>
