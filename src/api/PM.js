/**
 * 私信相关的API服务
 */

import $ from 'jquery';
import store from '@/store';
import { API_ENDPOINTS } from '@/config/api';

// 使用正确配置的API端点
const LIST = API_ENDPOINTS.MESSAGE.LIST;
const DETAIL = API_ENDPOINTS.MESSAGE.DETAIL;
const SEND = API_ENDPOINTS.MESSAGE.SEND;
const READ = API_ENDPOINTS.MESSAGE.READ;

/**
 * 获取私信列表
 * @returns {Promise} - 返回私信列表的Promise
 */
export function getChatList() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: LIST,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        console.error('获取私信列表失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 获取与特定用户的私信历史
 * @param {string|number} chatId - 聊天ID
 * @param {Object} params - 查询参数，如页码、每页条数等
 * @returns {Promise} - 返回私信历史的Promise
 */
export function getChatMessages(chatId, params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${DETAIL}/${chatId}`,
      type: 'GET',
      data: params,
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        console.error('获取私信历史失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 发送私信
 * @param {string|number} receiverId - 接收者ID
 * @param {string} content - 消息内容
 * @param {string} type - 消息类型，默认为'text'
 * @returns {Promise} - 返回发送结果的Promise
 */
export function MessageSent(receiverId, content, type = 'text') {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: SEND,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        receiverId,
        content,
        type
      }),
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        console.error('发送私信失败:', error);
        reject(error);
      }
    });
  });
}



/**
 * 标记消息为已读
 * @param {string|number} chatId - 聊天ID
 * @returns {Promise} - 返回标记结果的Promise
 */
export function markAsRead(chatId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${READ}/${chatId}`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        console.error('标记消息为已读失败:', error);
        reject(error);
      }
    });
  });
}

export default {
  getChatList,
  getChatMessages,
  MessageSent,
  markAsRead
};


