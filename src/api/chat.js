import $ from 'jquery';
import store from '@/store';
import { API_BASE_URL } from '@/config/api';

const CHAT_API_URL = `${API_BASE_URL}/chat`;



/**
 * 调用七牛云的deepseek服务（支持联网搜索）
 * @param {string} question - 用户问题
 * @param {boolean} [net=true] - 是否使用联网搜索功能
 * @param {function} [onChunk] - 处理流式响应的回调函数
 * @param {string} [systemPrompt=""] - 系统提示词
 * @returns {Promise} - 返回AI响应的Promise
 */
export function MyDeepseek(question, net = true, onChunk, systemPrompt = "") {
  // const apiKey = import.meta.env.VITE_LLM_API_KEY;
  const apiKey = "这里写你的大模型api";
  const apiUrl = "https://api.qnaigc.com/v1/chat/completions";
  const model = net ? "deepseek-v3?search" : "deepseek-v3";
  
  return new Promise((resolve, reject) => {
    // 创建完整响应对象
    const fullResponse = {
      id: '',
      object: 'chat.completion',
      created: Date.now(),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: ''
        },
        finish_reason: null
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      // file:{
      //   file:'',
      //   token:'', // 上传token
      //   key:'' // 文件名
      // }
    };
    
    // 使用XMLHttpRequest处理流式响应
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.responseType = 'text'; // 使用text而不是json
    
    // 处理流式响应
    let buffer = '';
    xhr.onprogress = function() {
      // 获取新的响应文本
      const newText = xhr.responseText.substring(buffer.length);
      buffer = xhr.responseText;
      
      // 处理新的响应块
      if (newText) {
        // 分割成单独的数据块
        const chunks = newText.split('\n\n').filter(chunk => chunk.trim() !== '');
        
        for (const chunk of chunks) {
          if (chunk.startsWith('data: ')) {
            try {
              // 解析JSON数据
              const jsonStr = chunk.substring(6); // 移除 "data: " 前缀
              if (jsonStr === '[DONE]') {
                // 流结束
                continue;
              }
              
              const data = JSON.parse(jsonStr);
              
              // 更新完整响应
              if (data.id) fullResponse.id = data.id;
              if (data.model) fullResponse.model = data.model;
              if (data.created) fullResponse.created = data.created;
              
              // 处理内容增量
              if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                
                // 更新内容
                if (choice.delta && choice.delta.content) {
                  fullResponse.choices[0].message.content += choice.delta.content;
                  
                  // 如果提供了回调函数，调用它
                  if (typeof onChunk === 'function') {
                    onChunk({
                      content: choice.delta.content,
                      fullContent: fullResponse.choices[0].message.content,
                      done: false
                    });
                  }
                }
                
                // 检查是否完成
                if (choice.finish_reason) {
                  fullResponse.choices[0].finish_reason = choice.finish_reason;
                }
              }
              
              // 更新使用情况
              if (data.usage) {
                fullResponse.usage = data.usage;
              }
            } catch (error) {
              console.error('解析流式响应块失败:', error, chunk);
            }
          }
        }
      }
    };
    
    // 请求完成
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 如果提供了回调函数，通知完成
        if (typeof onChunk === 'function') {
          onChunk({
            content: '',
            fullContent: fullResponse.choices[0].message.content,
            done: true
          });
        }
        
        resolve(fullResponse);
      } else {
        reject(new Error(`请求失败: ${xhr.status} ${xhr.statusText}`));
      }
    };
    
    // 请求错误
    xhr.onerror = function() {
      reject(new Error('网络错误'));
    };
    
    // 准备消息数组
    const messages = [];
    
    // 如果有系统提示词，添加到消息数组
    if (systemPrompt && systemPrompt.trim() !== '') {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    // 添加用户问题
    messages.push({ role: "user", content: question });
    
    // 发送请求
    xhr.send(JSON.stringify({
      messages: messages,
      model: model,
      stream: true
    }));
  });
}

/**
 * 发送聊天消息到AI
 * @param {string} message - 用户输入的消息
 * @returns {Promise} - 返回AI响应的Promise
 */
export function sendMessage(message) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${CHAT_API_URL}/send`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      data: JSON.stringify({ message }),
      contentType: 'application/json',
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      }
    });
  });
}

/**
 * 获取历史聊天记录
 * @param {number} page - 页码
 * @param {number} size - 每页条数
 * @returns {Promise} - 返回聊天记录的Promise
 */
export function getChatHistory(page = 1, size = 20) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${CHAT_API_URL}/history`,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      data: { page, size },
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      }
    });
  });
}

export default {
  sendMessage,
  getChatHistory
};

