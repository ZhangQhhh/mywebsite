<template>
  <Content>
    <div class="chat-container">
      <!-- 左侧聊天列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h2>私信列表</h2>
          <!-- 使用调试函数 -->
          <el-button type="primary" size="small" @click="createNewChat">
            <i class="bi bi-plus-circle"></i> 新建会话
          </el-button>
        </div>
        <div class="chat-list">
          <div v-for="chat in chatList" :key="chat.id" class="chat-item"
            :class="{ active: currentChat?.id === chat.id }" @click="selectChat(chat)">
            <div class="chat-avatar">
              <img :src="chat.avatar" :alt="chat.username">
              <span class="online-status" :class="{ 'is-online': chat.isOnline }"></span>
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
                <span class="status">{{ currentChat.isOnline ? '在线' : '离线' }}</span>
              </div>
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
/* eslint-disable no-unused-vars */
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Content from '@/components/ContentBase';
import PMessage from '@/components/PMessage.vue'
import { getChatList, getChatMessages, markAsRead, MessageSent } from '@/api/PM'
import { initWebSocket, closeWebSocket, onMessageType, offMessageType, getConnectionStatus } from '@/api/websocketService'
import emoji from '@/assets/emoji.ts'
import dayjs from 'dayjs'
import store from '@/store'
import { showAlert } from '@/utils'
// /* eslint-enable no-unused-vars */
import { ElMessage } from 'element-plus'
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
    const activeEmojiTab = ref(0) // 默认选中第一个表情包标签页
    const wsConnected = ref(false);
    const refreshInterval = ref(null);

    // 新增状态变量
    const showNewChatDialog = ref(false);
    const newChatForm = ref({
      userId: '',
      message: ''
    });
    const creating = ref(false);

    // 处理WebSocket连接状态变化
    const handleConnectionChange = (data) => {
      wsConnected.value = data.status === 'connected';

      // 如果连接断开，尝试重新连接
      if (data.status === 'disconnected' || data.status === 'error') {
        console.warn('WebSocket连接断开，尝试重新连接');
        // 重连由websocketService内部处理
      }

      // 如果连接成功，并且当前有选中的聊天，刷新消息
      if (data.status === 'connected' && currentChat.value) {

        loadMessages(currentChat.value.id);
      }
    };

    // 检查WebSocket连接状态并在必要时重连
    const checkWebSocketConnection = () => {
      if (!getConnectionStatus()) {
        
        initWebSocket();
        return false;
      }
      return true;
    };

    // 改进的处理新消息函数
    const handleNewMessage = (data) => {
      console.log('处理新消息:', data);
      
      if (!data || !data.message) {
        console.error('消息数据格式不正确:', data);
        return;
      }
      
      const { message, senderId } = data;
      const currentUserId = String(store.state.user.id);
      const senderIdStr = String(senderId);
      const isMine = senderIdStr === currentUserId;

      // 检查消息是否包含表情
      let messageType = message.type || 'text';
      let messageContent = message.content;

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
      // 修改判断逻辑：如果是自己发送的消息，检查接收者是否是当前聊天对象
      // 如果是接收到的消息，检查发送者是否是当前聊天对象
      const isCurrentChat = currentChat.value && (
        (isMine && message.receiverId && String(currentChat.value.id) === String(message.receiverId)) || 
        (!isMine && String(currentChat.value.id) === senderIdStr)
      );

      console.log('是否当前聊天:', isCurrentChat, '当前聊天ID:', currentChat.value?.id, '发送者ID:', senderIdStr);

      if (isCurrentChat) {
        // 添加到消息列表
        messages.value.push(newMessage);

        // 更新会话缓存
        try {
          sessionStorage.setItem(`chat_${currentChat.value.id}`, JSON.stringify(messages.value));
        } catch (error) {
          console.error('更新会话缓存失败:', error);
        }

        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });

        // 如果是收到的消息，标记为已读
        if (!isMine) {
          markAsRead(currentChat.value.id).catch(error => {
            console.error('标记为已读失败:', error);
          });
        }
      } else {
        // 不是当前聊天，更新聊天列表
        loadChatList();

        // 如果是收到的消息，显示通知
        if (!isMine) {
          const sender = chatList.value.find(c => String(c.id) === senderIdStr);
          const senderName = sender?.username || '有人';

          // 显示系统通知
          if ('Notification' in window && Notification.permission === 'granted') {
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
        }
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
                unreadCount: chat.unread_count || 0
              };
            });

          // 如果当前有选中的聊天，更新其头像
          if (currentChat.value) {
            const updatedChat = chatList.value.find(chat => chat.id === currentChat.value.id);
            if (updatedChat) {
              currentChat.value.avatar = updatedChat.avatar;
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

    // 发送消息
    const sendMessage = async () => {
      if (!messageInput.value.trim() || sending.value || !currentChat.value) {
        return;
      }

      // 检查WebSocket连接状态
      if (!checkWebSocketConnection()) {
        showAlert('网络连接不稳定，请稍后重试');
        return;
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

        

        // 发送到服务器 - 始终发送原始内容，让服务器处理
        const response = await MessageSent(currentChat.value.id, content);
       

        // 更新消息状态
        const index = messages.value.findIndex(m => m.id === tempId);
        if (index !== -1) {
          if (response && response.data && response.data.message) {
            // 用服务器返回的消息ID替换临时ID，但保留我们的类型和内容处理
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

        // 更新聊天列表中的最后一条消息
        const chatIndex = chatList.value.findIndex(c => c.id === currentChat.value.id);
        if (chatIndex !== -1) {
          chatList.value[chatIndex].lastMessage = content;
          chatList.value[chatIndex].lastMessageTime = new Date();
        }
      } catch (error) {
        console.error('发送消息失败:', error);
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
    }

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
    onMounted(async () => {
      // 定义一个内部函数来处理创建新会话
      const handlePendingChatUser = (userId) => {
        if (!userId) return;
        
        console.log(`创建与用户 ${userId} 的新会话`);
        
        // 检查是否已经有与该用户的会话
        const existingChat = chatList.value.find(chat => String(chat.id) === String(userId));
        
        if (existingChat) {
          // 如果已经有会话，直接选择该会话
          console.log('找到现有会话，直接选择');
          selectChat(existingChat);
          return;
        }
        
        // 如果没有现有会话，创建新会话
        newChatForm.value = {
          userId: userId,
          message: ''
        };
        
        // 显示新建会话对话框，让用户输入第一条消息
        showNewChatDialog.value = true;
      };
      
      // 检查是否有待处理的聊天用户ID
      const pendingUserId = localStorage.getItem('pendingChatUserId');
      if (pendingUserId) {
        // 清除localStorage中的ID
        localStorage.removeItem('pendingChatUserId');
        // 处理待处理的用户ID
        handlePendingChatUser(pendingUserId);
      }
      
      // 将createNewChatWithUser方法暴露给全局，以便其他组件可以调用
      if (typeof window !== 'undefined') {
        // 确保Vue应用实例存在
        if (window.__vue_app__) {
          window.__vue_app__.config.globalProperties.$messageView = {
            createNewChatWithUser: handlePendingChatUser
          };
        }
      }
      
      // 初始化WebSocket
      initWebSocket();
      
      // 添加调试日志
      console.log('WebSocket初始化完成');
      
      // 注册WebSocket消息处理函数
      console.log('注册WebSocket消息处理函数');
      
      onMessageType('connection', (data) => {
        console.log('收到连接状态消息:', data);
        handleConnectionChange(data);
      });
      
      onMessageType('message', (data) => {
        console.log('收到message类型消息:', data);
        handleNewMessage(data);
      });
      
      onMessageType('unreadCount', (data) => {
        console.log('收到未读消息计数:', data);
        loadChatList();
      });
      
      // 添加错误处理
      onMessageType('error', (data) => {
        console.error('WebSocket错误:', data);
        // 尝试重新连接
        setTimeout(() => {
          console.log('尝试重新连接WebSocket');
          initWebSocket();
        }, 3000);
      });
      
      // 设置定时检查WebSocket连接状态
      const checkConnectionInterval = setInterval(() => {
        if (!getConnectionStatus()) {
          console.log('WebSocket连接已断开，尝试重新连接');
          initWebSocket();
        }
      }, 5000);
      
      // 在组件卸载时清除定时器
      onUnmounted(() => {
        clearInterval(checkConnectionInterval);
        // 其他清理代码...
      });
      
      // 加载聊天列表
      await loadChatList();
      
      // 检查路由参数
      if (route.params.chatId) {
        const chat = chatList.value.find(c => String(c.id) === String(route.params.chatId));
        if (chat) {
          selectChat(chat);
        }
      }
      
      // 设置定时刷新
      refreshInterval.value = setInterval(() => {
        if (currentChat.value) {
          checkWebSocketConnection();
        }
      }, 10000);
    });

    // 组件卸载时清理
    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
      
      offMessageType('connection', handleConnectionChange);
      offMessageType('message', handleNewMessage);
      offMessageType('unreadCount');
      offMessageType('error');
      closeWebSocket();
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
      submitNewChat
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

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
  border: 2px solid #ffffff;
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
