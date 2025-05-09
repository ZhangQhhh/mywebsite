<template>
  <Content>
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <h1 class="mb-4">Deepseek AI 测试页面</h1>
          <p class="lead">
            这个页面用于测试七牛云的 Deepseek AI 服务功能。您可以输入问题，选择是否启用联网搜索，然后查看 AI 的响应。
          </p>
          
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">功能说明</h5>
            </div>
            <div class="card-body">
              <p>
                <strong>Deepseek AI</strong> 是七牛云提供的大语言模型服务，具有以下特点：
              </p>
              <ul>
                <li>支持自然语言问答</li>
                <li>可选的联网搜索功能，获取最新信息</li>
                <li>流式响应，逐步生成内容</li>
                <li>支持代码生成和解释</li>
              </ul>
              <p>
                本测试页面调用 <code>MyDeepseek</code> 函数，该函数封装了对七牛云 Deepseek API 的调用。
              </p>
            </div>
          </div>
          
          <DeepseekTest />
          
          <div class="mt-5">
            <h3>API 说明</h3>
            <pre class="bg-light p-3 rounded">
/**
 * 调用七牛云的deepseek服务（支持联网搜索）
 * @param {string} question - 用户问题
 * @param {boolean} [net=true] - 是否使用联网搜索功能
 * @returns {Promise} - 返回AI响应的Promise
 */
export function MyDeepseek(question, net) {
  // 实现细节...
}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<script setup>
import Content from '@/components/ContentBase.vue';
import DeepseekTest from '@/components/testTemp/DeepseekTest.vue';
</script>

<style scoped>
pre {
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>