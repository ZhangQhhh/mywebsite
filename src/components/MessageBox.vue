<template>
  <!-- Toast容器 -->
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div v-for="(toast, index) in toasts" :key="index"
         class="toast"
         :class="getToastClass(toast.type)">
      <!-- Toast内容 -->
    </div>
  </div>

  <!-- 确认对话框 -->
  <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmModalLabel">{{ confirmTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          {{ confirmMessage }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="handleCancel">取消</button>
          <button type="button" class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'MessageBox',
  setup() {
    const toasts = reactive([]);
    const confirmTitle = ref('确认');
    const confirmMessage = ref('');
    const confirmCallback = ref(null);
    let confirmModal = null;

    // 添加 toast 的方法
    const addToast = (message, type = 'info') => {
      const toast = {
        id: Date.now(),
        message,
        type,
        show: true
      };
      toasts.push(toast);
      setTimeout(() => {
        const index = toasts.indexOf(toast);
        if (index > -1) {
          toasts.splice(index, 1);
        }
      }, 3000);
    };

    // 添加所有必需的显示方法
    const showSuccess = (message) => addToast(message, 'success');
    const showError = (message) => addToast(message, 'danger');
    const showWarning = (message) => addToast(message, 'warning');
    const showInfo = (message) => addToast(message, 'info');

    // 获取 toast 样式类
    const getToastClass = (type) => {
      return {
        'bg-success text-white': type === 'success',
        'bg-danger text-white': type === 'danger',
        'bg-warning': type === 'warning',
        'bg-info text-white': type === 'info'
      };
    };

    // 初始化模态框
    const initModal = () => {
      const modalElement = document.getElementById('confirmModal');
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        try {
          // 移除之前可能存在的事件监听器，防止重复添加
          modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);

          // 创建模态框实例
          confirmModal = new window.bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });

          // 添加模态框隐藏事件监听器
          modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        } catch (error) {
          console.error('初始化模态框失败:', error);
          confirmModal = null;
        }
      }
    };

    // 处理模态框隐藏事件
    const handleModalHidden = () => {
      // 如果模态框被隐藏但没有通过按钮点击（例如点击背景或按ESC键），也调用取消回调
      if (confirmCallback.value) {
        const callback = confirmCallback.value;
        confirmCallback.value = null; // 防止重复调用

        // 使用setTimeout确保在事件处理完成后调用回调
        setTimeout(() => {
          safeCallCallback(callback, false);
        }, 0);
      }
    };

    // 显示确认对话框
    const showConfirm = (message, title = '确认', callback = null) => {
      // 设置确认对话框的标题和消息
      confirmTitle.value = title;
      confirmMessage.value = message;

      // 保存回调函数的引用
      // 先清空之前的回调，防止重复调用
      confirmCallback.value = null;

      // 延迟设置回调，确保之前的回调已被清理
      setTimeout(() => {
        confirmCallback.value = callback;
      }, 0);

      // 确保模态框已初始化
      if (!confirmModal) {
        initModal();
      }

      // 显示模态框
      if (confirmModal) {
        try {
          confirmModal.show();
        } catch (error) {
          console.error('显示确认对话框失败:', error);
          // 降级处理：使用原生confirm
          if (callback) {
            const result = window.confirm(message);
            safeCallCallback(callback, result);
          }
        }
      } else {
        // 降级处理：使用原生confirm
        if (callback) {
          const result = window.confirm(message);
          safeCallCallback(callback, result);
        }
      }
    };

    // 安全地调用回调函数
    const safeCallCallback = (callback, result) => {
      if (callback && typeof callback === 'function') {
        try {
          callback(result);
        } catch (error) {
          console.error('确认回调执行错误:', error);
        }
      }
    };

    // 处理确认按钮点击
    const handleConfirm = () => {
      // 保存回调的引用，然后清空存储的回调
      const callback = confirmCallback.value;
      confirmCallback.value = null;

      // 隐藏模态框
      if (confirmModal) {
        try {
          confirmModal.hide();
        } catch (error) {
          console.error('隐藏确认对话框失败:', error);
        }
      }

      // 安全地调用回调
      if (callback) {
        // 使用setTimeout确保模态框已完全关闭
        setTimeout(() => {
          safeCallCallback(callback, true);
        }, 100);
      }
    };

    // 处理取消按钮点击
    const handleCancel = () => {
      // 保存回调的引用，然后清空存储的回调
      const callback = confirmCallback.value;
      confirmCallback.value = null;

      // 安全地调用回调
      if (callback) {
        // 使用setTimeout确保模态框已完全关闭
        setTimeout(() => {
          safeCallCallback(callback, false);
        }, 100);
      }
    };

    onMounted(() => {
      initModal();
    });

    return {
      toasts,
      confirmTitle,
      confirmMessage,
      showConfirm,
      handleConfirm,
      handleCancel,
      handleModalHidden,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      getToastClass,
      safeCallCallback
    };
  }
};
</script>

<style scoped>
.toast {
  min-width: 250px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  opacity: 1 !important;
  margin-bottom: 0.75rem;
}

.toast-container {
  max-width: 100%;
  z-index: 1100;
}

.toast {
  transition: all 0.3s ease;
  animation: toast-in 0.3s;
}

@keyframes toast-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 确认对话框样式 */
.modal-title {
  font-weight: 600;
  color: #333;
}

.modal-body {
  font-size: 1rem;
  padding: 1.5rem;
  color: #555;
}

.modal-footer .btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.modal-footer .btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.modal-content {
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>
