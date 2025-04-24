import { createApp } from 'vue';
import MessageBox from '@/components/MessageBox.vue';

// 创建一个消息实例
let messageInstance = null;
let messageContainer = null;

// 创建消息实例
const createMessageInstance = () => {
  // 如果已经存在实例，则直接返回
  if (messageInstance) {
    return messageInstance;
  }

  // 创建容器元素
  messageContainer = document.createElement('div');
  messageContainer.className = 'message-container';
  document.body.appendChild(messageContainer);

  // 创建Vue应用实例
  const app = createApp(MessageBox);
  const instance = app.mount(messageContainer);

  // 确保所有必要的方法都存在
  const methods = ['showSuccess', 'showError', 'showWarning', 'showInfo', 'showConfirm'];
  methods.forEach(method => {
    if (!instance[method]) {
      console.warn(`MessageBox实例缺少${method}方法`);
      // 提供默认实现
      instance[method] = (message) => {
        console.log(`${method}:`, message);
        return instance.addToast ? instance.addToast(message, method.replace('show', '').toLowerCase()) : null;
      };
    }
  });

  messageInstance = instance;
  return instance;
};

// 确保实例已创建并且可用
const getInstance = () => {
  if (!messageInstance) {
    messageInstance = createMessageInstance();
  }

  // 二次检查确保实例可用
  if (messageInstance && !messageInstance.showInfo) {
    console.warn('MessageBox实例缺少showInfo方法，动态添加');
    messageInstance.showInfo = messageInstance.showSuccess || function(message) {
      return messageInstance.addToast ? messageInstance.addToast(message, 'info') : null;
    };
  }

  return messageInstance;
};

// 导出消息方法
export default {
  success(message) {
    const instance = getInstance();
    if (instance && instance.showSuccess) {
      instance.showSuccess(message);
    }
  },
  error(message) {
    const instance = getInstance();
    if (instance && instance.showError) {
      instance.showError(message);
    }
  },
  warning(message) {
    const instance = getInstance();
    if (instance && instance.showWarning) {
      instance.showWarning(message);
    }
  },
  info(message) {
    const instance = getInstance();
    if (instance && instance.showInfo) {
      instance.showInfo(message);
    }
  },
  confirm(message, title, callback) {
    const instance = getInstance();
    if (instance && instance.showConfirm) {
      instance.showConfirm(message, title, callback);
    }
  }
};

// 替代原生alert的函数
export const showAlert = (message) => {
  const instance = getInstance();
  if (instance && typeof instance.showInfo === 'function') {
    instance.showInfo(message);
  } else {
    // 降级处理：如果showInfo不可用，使用console.log并尝试使用原生alert
    console.log('消息提示:', message);
    try {
      window.alert(message);
    } catch (e) {
      console.error('无法显示消息:', message, e);
    }
  }
};

// 替代原生confirm的函数
export const showConfirm = (message, title, callback) => {
  // 处理参数顺序问题
  if (typeof title === 'function' && callback === undefined) {
    // 如果第二个参数是函数，则它是回调
    callback = title;
    title = '确认';
  } else if (title === undefined) {
    // 如果没有提供标题，使用默认值
    title = '确认';
  }

  console.log('调用全局showConfirm函数', {
    message,
    title,
    callbackType: typeof callback,
    hasCallback: !!callback
  });



  // 调用实例的showConfirm方法
  const instance = getInstance();
  if (instance && typeof instance.showConfirm === 'function') {
    instance.showConfirm(message, title, callback);
  } else {
    console.error('MessageBox实例缺少showConfirm方法，使用原生confirm');
    try {
      const confirmed = window.confirm(message);
      if (callback && typeof callback === 'function') {
        callback(confirmed);
      }
    } catch (e) {
      console.error('无法显示确认对话框:', e);
    }
  }
};
