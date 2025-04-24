import $ from 'jquery';
import store from '@/store';
import { API_BASE_URL } from '@/config/api';

const CHAT_API_URL = `${API_BASE_URL}/chat`;

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
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
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
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

export default {
  sendMessage,
  getChatHistory
};