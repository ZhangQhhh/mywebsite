/**
 * 管理员相关的API服务
 */

// 导入jQuery
import $ from 'jquery';
// 导入store
import store from '@/store';
import { API_ENDPOINTS } from '@/config/api';

export function getUserList(params={}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADMIN.USERS,
      type: 'GET',
      data: params,
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      xhrFields:{ withCredentials: true },
      success: function(response) {
        // 确保用户状态是字符串类型
        if (response.users && Array.isArray(response.users)) {
          response.users = response.users.map(user => ({
            ...user,
            status: String(user.status)
          }));
        }
        resolve(response);
      },
      error: function(error) {
        console.error(`获取用户列表API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 封禁用户
 * @param {Number} userId - 用户ID
 * @returns {Promise} - 返回操作结果的Promise
 */
export function banUser(userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_ENDPOINTS.ADMIN.BAN}/${userId}`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        // 确保状态是字符串
        if (response.status !== undefined) {
          response.status = String(response.status);
        }
        resolve(response);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

/**
 * 解封用户
 * @param {Number} userId - 用户ID
 * @returns {Promise} - 返回操作结果的Promise
 */
export function unbanUser(userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_ENDPOINTS.ADMIN.UNBAN}/${userId}`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        // 确保状态是字符串
        if (response.status !== undefined) {
          response.status = String(response.status);
        }
        resolve(response);
      },
      error: function(error) {
        console.error(`解除封禁用户API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 重置用户密码
 * @param {Object} data - 包含用户ID和新密码的对象 {userId, newPassword}
 * @returns {Promise} - 返回操作结果的Promise
 */
export function resetUserPassword(data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: API_ENDPOINTS.ADMIN.RESET_PASSWORD,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

// getUserPosts函数已移至post.js，请使用post.js中的getUserPosts函数
// 此处移除以避免代码重复
