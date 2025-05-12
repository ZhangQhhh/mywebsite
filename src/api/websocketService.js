import store from '@/store';

// WebSocket 连接实例
let socket = null;
// 连接状态
let isConnected = false;
// 消息处理函数映射
const messageHandlers = new Map();
// 重连相关
let reconnectTimer = null;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;
const RECONNECT_DELAY = 3000;
let isConnecting = false;

/**
 * 获取WebSocket URL
 * @returns {string} WebSocket URL
 */
function getWsUrl() {
  // 从store获取JWT令牌
  const token = store.state.user.token;
  if (!token) {
    console.error('获取WebSocket URL失败: 未找到用户令牌');
    return null;
  }
  
  // 检查令牌格式是否正确（JWT应该包含两个点）
  if (!token.includes('.')) {
    console.error('获取WebSocket URL失败: 令牌格式不正确');
    return null;
  }
  
  // 根据环境构建WebSocket URL
  if (process.env.NODE_ENV === 'production') {
    // 生产环境
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${wsProtocol}//${host}/websocket/${token}`;
  } else {
    // 开发环境 - 注意这里移除了/ws路径段
    return `ws://localhost:3000/websocket/${token}`;
  }
}

/**
 * 初始化WebSocket连接
 * @returns {boolean} 是否成功初始化
 */
export function initWebSocket() {
  
  // 如果已经有连接或正在连接，则返回
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) || isConnecting) {
    return;
  }
  
  isConnecting = true;
  
  try {
    const wsUrl = getWsUrl();
    if (!wsUrl) {
      console.error('初始化WebSocket失败: 无法获取WebSocket URL');
      isConnecting = false;
      return;
    }
    
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {

      isConnected = true; // 更新连接状态
      isConnecting = false;
      reconnectAttempts = 0;
      
      // 触发连接事件
      triggerEvent('connection', { status: 'connected' });
      
      // 移除心跳相关代码
      // startHeartbeat();
    };
    
    socket.onclose = (event) => {
      isConnected = false; // 更新连接状态
      isConnecting = false;
      
      // 触发断开连接事件
      triggerEvent('connection', { status: 'disconnected', code: event.code });
      
      // 尝试重连
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        // console.log(`WebSocket连接关闭，${RECONNECT_DELAY/1000}秒后尝试重连...`);
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          initWebSocket();
        }, RECONNECT_DELAY);
      } else {
        console.error('WebSocket重连次数超过最大限制，停止重连');
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket连接错误:', error);
      isConnected = false; // 更新连接状态
      isConnecting = false;
      
      // 触发错误事件
      triggerEvent('connection', { status: 'error', error });
    };
    
    socket.onmessage = (event) => {
      console.log('收到WebSocket原始消息:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('解析后的WebSocket消息:', data);
        
        // 处理消息
        if (data.type) {
          console.log(`收到类型为 ${data.type} 的消息`);
          if (messageHandlers.has(data.type)) {
            console.log(`找到 ${data.type} 类型的处理函数，调用处理函数`);
            messageHandlers.get(data.type).forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                console.error(`处理 ${data.type} 类型的消息出错:`, error);
              }
            });
          } else {
            console.log(`没有找到 ${data.type} 类型的处理函数`);
            
            // 如果没有找到对应类型的处理函数，但消息类型是message，尝试使用默认处理
            if (data.type === 'message' && messageHandlers.has('message')) {
              console.log('尝试使用默认message处理函数');
              messageHandlers.get('message').forEach(handler => {
                try {
                  handler(data);
                } catch (error) {
                  console.error('处理message消息出错:', error);
                }
              });
            }
          }
        } else {
          console.warn('收到的消息没有type字段:', data);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error, event.data);
      }
    };
    
    return true;
  } catch (error) {
    console.error('初始化WebSocket时发生错误:', error);
    isConnected = false;
    isConnecting = false;
    return false;
  }
}

/**
 * 关闭WebSocket连接
 */
export function closeWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (socket) {
    socket.close();
    socket = null;
  }
  
  isConnected = false;
}

/**
 * 发送WebSocket消息
 * @param {Object} data - 要发送的消息数据
 * @returns {boolean} 是否成功发送
 */
export function sendMessage(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket未连接，无法发送消息');
    return false;
  }
  
  try {
    socket.send(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('发送WebSocket消息失败:', error);
    return false;
  }
}

/**
 * 注册消息处理函数
 * @param {string} type - 消息类型
 * @param {Function} callback - 处理函数
 * @returns {Function} 用于移除处理函数的函数
 */
export function onMessageType(type, callback) {
  // console.log(`注册 ${type} 类型的消息处理函数`);
  if (!messageHandlers.has(type)) {
    messageHandlers.set(type, []);
  }
  messageHandlers.get(type).push(callback);
  return () => offMessageType(type, callback);
}

/**
 * 移除消息处理函数
 * @param {string} type - 消息类型
 * @param {Function} handler - 要移除的处理函数
 */
export function offMessageType(type, handler) {
  if (messageHandlers.has(type)) {
    const handlers = messageHandlers.get(type);
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
}

/**
 * 触发事件
 * @param {string} type - 事件类型
 * @param {Object} data - 事件数据
 */
function triggerEvent(type, data) {
  if (messageHandlers.has(type)) {
    messageHandlers.get(type).forEach(handler => handler(data));
  }
}

/**
 * 获取连接状态
 * @returns {boolean} 是否已连接
 */
export function getConnectionStatus() {
  return isConnected;
}

/**
 * 发送请求并等待响应
 * @param {string} action - 请求动作
 * @param {Object} data - 请求数据
 * @returns {Promise} 响应Promise
 */
export function sendRequest(action, data = {}) {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket未连接，无法发送请求'));
      return;
    }
    
    // 生成唯一请求ID
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const request = { id, action, data };
    
    // 设置超时处理
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'));
    }, 10000); // 10秒超时
    
    // 一次性监听响应
    const responseHandler = (response) => {
      if (response.id === id) {
        clearTimeout(timeout);
        offMessageType('response', responseHandler);
        resolve(response);
      }
    };
    
    // 注册响应处理函数
    onMessageType('response', responseHandler);
    
    // 发送请求
    try {
      socket.send(JSON.stringify(request));
    } catch (error) {
      clearTimeout(timeout);
      offMessageType('response', responseHandler);
      reject(error);
    }
  });
}

export default {
  initWebSocket,
  closeWebSocket,
  sendMessage,
  onMessageType,
  offMessageType,
  getConnectionStatus,
  sendRequest
};



