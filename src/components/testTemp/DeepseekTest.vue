<template>
  <div class="deepseek-test">
    <h2>Deepseek AI 测试</h2>
    
    <div class="card">
      <div class="card-body">
        <div class="form-group mb-3">
          <label for="question" class="form-label">输入您的问题:</label>
          <textarea 
            id="question" 
            v-model="question" 
            class="form-control" 
            rows="4" 
            placeholder="例如: 请介绍一下量子计算的基本原理"
          ></textarea>
        </div>
        
        <div class="form-check mb-3">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="useNetSearch" 
            v-model="useNetSearch"
          >
          <label class="form-check-label" for="useNetSearch">
            启用联网搜索
          </label>
        </div>
        
        <div class="d-flex gap-2 mb-3">
          <button 
            class="btn btn-primary" 
            @click="askQuestion" 
            :disabled="isLoading || !question.trim()"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isLoading ? '请求中...' : '发送问题' }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="clearResponse"
          >
            清空响应
          </button>
        </div>
        
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
      </div>
    </div>
    
    <div v-if="isLoading || response" class="card mt-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">AI 响应</h5>
        <span v-if="isLoading" class="badge bg-info">正在生成...</span>
        <span v-else class="badge bg-success">完成</span>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="d-flex align-items-center">
          <div class="spinner-grow text-primary me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span>AI 正在思考中...</span>
        </div>
        <div v-else class="response-content">
          <!-- 使用mavon-editor来渲染Markdown -->
          <mavon-editor
            v-model="response"
            :subfield="false"
            :defaultOpen="'preview'"
            :toolbarsFlag="false"
            :editable="false"
            :scrollStyle="true"
            :ishljs="true"
            :navigation="true"
            class="preview-editor"
          />
        </div>
      </div>
      <div class="card-footer text-muted">
        <div class="d-flex justify-content-between">
          <span>模型: {{ useNetSearch ? 'deepseek-v3?search' : 'deepseek-v3' }}</span>
          <span v-if="responseTime">响应时间: {{ responseTime }}秒</span>
        </div>
      </div>
    </div>
    
    <div class="mt-4">
      <h5>使用说明:</h5>
      <ul>
        <li>输入您想问的问题</li>
        <li>选择是否启用联网搜索功能</li>
        <li>点击"发送问题"按钮</li>
        <li>等待AI响应</li>
      </ul>
      <p class="text-muted">
        <small>注意: 此功能调用七牛云的deepseek服务，需要有效的API密钥。</small>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { MyDeepseek } from '@/api/chat';

// 响应式状态
const question = ref('');
const useNetSearch = ref(true);
const response = ref('');
const isLoading = ref(false);
const error = ref('');
const startTime = ref(null);
const endTime = ref(null);

// 计算属性
const responseTime = computed(() => {
  if (startTime.value && endTime.value) {
    return ((endTime.value - startTime.value) / 1000).toFixed(2);
  }
  return null;
});

// 发送问题到AI
const askQuestion = async () => {
  if (!question.value.trim()) return;
  
  isLoading.value = true;
  error.value = '';
  response.value = '';
  startTime.value = Date.now();
  
  try {
    console.log(`发送问题到Deepseek AI: "${question.value}"`);
    console.log(`联网搜索: ${useNetSearch.value ? '启用' : '禁用'}`);
    
    // 调用MyDeepseek函数
    const result = await MyDeepseek(question.value, useNetSearch.value);
    
    endTime.value = Date.now();
    console.log('Deepseek响应:', result);
    
    // 处理响应
    if (result && result.choices && result.choices.length > 0) {
      response.value = result.choices[0].message.content;
    } else {
      response.value = '收到了响应，但格式不符合预期。请查看控制台获取详细信息。';
      console.warn('意外的响应格式:', result);
    }
  } catch (err) {
    endTime.value = Date.now();
    console.error('Deepseek请求失败:', err);
    error.value = `请求失败: ${err.message || '未知错误'}`;
    
    // 添加更多错误详情
    if (err.response) {
      console.error('错误响应:', err.response);
      error.value += `\n状态码: ${err.response.status}`;
      if (err.response.data) {
        error.value += `\n详情: ${JSON.stringify(err.response.data)}`;
      }
    }
  } finally {
    isLoading.value = false;
  }
};

// 清空响应
const clearResponse = () => {
  response.value = '';
  error.value = '';
  startTime.value = null;
  endTime.value = null;
};
</script>

<style scoped>
.deepseek-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.response-content {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 调整mavon-editor的样式 */
.preview-editor {
  min-height: 200px;
  border: none !important;
}

.preview-editor :deep(.v-note-wrapper) {
  min-height: 200px;
  z-index: 1;
}

.preview-editor :deep(.v-note-panel) {
  border: none !important;
}

.preview-editor :deep(.v-note-navigation-wrapper) {
  border-left: 1px solid #ddd;
}
</style>
