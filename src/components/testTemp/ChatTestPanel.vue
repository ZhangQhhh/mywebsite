<template>
    <div class="chat-test-panel">
        <h2>WebSocket 聊天测试面板</h2>

        <!-- 连接状态 -->
        <div class="connection-status">
            <span :class="['status-indicator', { 'connected': isConnected }]"></span>
            <span>{{ connectionStatus }}</span>
            <button @click="connectWebSocket" :disabled="isConnected">连接</button>
            <button @click="disconnectWebSocket" :disabled="!isConnected">断开</button>
        </div>

        <!-- 消息发送区域 -->
        <div class="message-sender">
            <div class="form-group">
                <label for="receiver-id">接收者ID:</label>
                <input type="number" id="receiver-id" v-model="receiverId" />
            </div>
            <div class="form-group">
                <label for="message-content">消息内容:</label>
                <textarea id="message-content" v-model="messageContent" rows="3"></textarea>
            </div>
            <button @click="sendMessage" :disabled="!isConnected || !receiverId || !messageContent">
                发送消息
            </button>
        </div>

        <!-- 消息显示区域 -->
        <div class="message-display">
            <h3>消息记录</h3>
            <div class="message-list">
                <div v-for="(msg, index) in messages" :key="index"
                    :class="['message', { 'sent': msg.isSent, 'received': !msg.isSent }]">
                    <div class="message-header">
                        <span class="message-type">{{ msg.type }}</span>
                        <span class="message-time">{{ formatTime(msg.time) }}</span>
                    </div>
                    <pre class="message-body">{{ msg.content }}</pre>
                </div>
            </div>
        </div>

        <!-- 未读消息数量 -->
        <div class="unread-count" v-if="unreadCount > 0">
            未读消息: {{ unreadCount }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useStore } from 'vuex';

// 使用Vuex store
const store = useStore();

// 响应式状态
const isConnected = ref(false);
const connectionStatus = ref('未连接');
const receiverId = ref('');
const messageContent = ref('');
const messages = ref([]);
const unreadCount = ref(0);
const socket = ref(null);

// 计算WebSocket URL
const wsBaseUrl = computed(() => {
    // 根据环境使用不同的WebSocket URL
    if (process.env.NODE_ENV === 'production') {
        // 生产环境使用相对路径，浏览器会自动处理协议
        return '/websocket';
    } else {
        // 开发环境使用环境变量或默认值
        return process.env.VUE_APP_WS_URL || 'ws://localhost:3000/websocket';
    }
});

// 获取完整的WebSocket URL
const getFullWsUrl = (token) => {
    if (process.env.NODE_ENV === 'production') {
        // 生产环境：使用相对路径，浏览器会自动处理协议和域名
        return `${wsBaseUrl.value}/${token}`;
    } else {
        // 开发环境：使用完整URL
        return `${wsBaseUrl.value}/${token}`;
    }
};

// 连接WebSocket
const connectWebSocket = () => {
    try {
        // 从localStorage获取token
        const token = localStorage.getItem('token') || store.state.user?.token;
        if (!token) {
            addMessage('错误', '请先登录获取token', true);
            return;
        }

        // 创建WebSocket连接
        const wsUrl = getFullWsUrl(token);
        console.log('正在连接WebSocket:', wsUrl);
        socket.value = new WebSocket(wsUrl);

        // 连接打开事件
        socket.value.onopen = () => {
            isConnected.value = true;
            connectionStatus.value = '已连接';
            addMessage('系统', '连接已建立', true);
        };

        // 接收消息事件
        socket.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('收到WebSocket消息:', data);

                // 处理不同类型的消息
                if (data.type === 'message') {
                    addMessage('收到消息',
                        `发送者ID: ${data.senderId}\n内容: ${data.content}\n时间: ${data.createTime}`,
                        false);
                } else if (data.type === 'unreadCount') {
                    unreadCount.value = data.count;
                    addMessage('未读消息', `未读消息数量: ${data.count}`, false);
                } else if (data.type === 'confirm') {
                    addMessage('发送确认', `消息ID: ${data.messageId}\n状态: ${data.status}`, false);
                } else {
                    addMessage('其他消息', JSON.stringify(data, null, 2), false);
                }
            } catch (error) {
                console.error('解析WebSocket消息失败:', error);
                addMessage('错误', `消息解析错误: ${error.message}`, false);
            }
        };

        // 连接关闭事件
        socket.value.onclose = (event) => {
            isConnected.value = false;
            connectionStatus.value = '连接已关闭';
            addMessage('系统', `连接已关闭: ${event.code} ${event.reason || ''}`, true);
        };

        // 连接错误事件
        socket.value.onerror = (error) => {
            console.error('WebSocket错误:', error);
            isConnected.value = false;
            connectionStatus.value = '连接错误';
            addMessage('错误', `WebSocket错误: ${error.message || '未知错误'}`, true);
        };
    } catch (error) {
        console.error('连接WebSocket失败:', error);
        addMessage('错误', `连接失败: ${error.message}`, true);
    }
};

// 断开WebSocket连接
const disconnectWebSocket = () => {
    if (socket.value) {
        socket.value.close();
        socket.value = null;
    }
};

// 发送消息
const sendMessage = () => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        addMessage('错误', 'WebSocket未连接', true);
        return;
    }

    try {
        const message = {
            receiverId: parseInt(receiverId.value),
            content: messageContent.value
        };

        socket.value.send(JSON.stringify(message));
        addMessage('发送消息', JSON.stringify(message, null, 2), true);
        messageContent.value = ''; // 清空输入框
    } catch (error) {
        console.error('发送消息失败:', error);
        addMessage('错误', `发送失败: ${error.message}`, true);
    }
};

// 添加消息到列表
const addMessage = (type, content, isSent) => {
    messages.value.unshift({
        type,
        content,
        isSent,
        time: new Date()
    });
};

// 格式化时间
const formatTime = (time) => {
    return new Date(time).toLocaleString();
};

// 组件挂载时自动连接
onMounted(() => {
    // 可以选择自动连接或手动连接
    // connectWebSocket();
    console.log('ChatTestPanel 组件已挂载');
});

// 组件卸载时断开连接
onUnmounted(() => {
    disconnectWebSocket();
    console.log('ChatTestPanel 组件已卸载');
});
</script>

<style scoped>
.chat-test-panel {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.connection-status {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.status-indicator {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ff4d4f;
    margin-right: 8px;
}

.status-indicator.connected {
    background-color: #52c41a;
}

button {
    margin-left: 10px;
    padding: 5px 10px;
    cursor: pointer;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
}

.message-display {
    margin-top: 20px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 10px;
    height: 400px;
    overflow-y: auto;
}

.message-list {
    display: flex;
    flex-direction: column-reverse;
}

.message {
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    max-width: 80%;
}

.message.sent {
    align-self: flex-end;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
}

.message.received {
    align-self: flex-start;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
}

.message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 12px;
    color: #888;
}

.message-body {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}

.unread-count {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 10px;
    display: inline-block;
}
</style>
