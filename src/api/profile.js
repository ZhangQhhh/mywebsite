/**
 * 用户个人资料相关的API服务
 */

// 导入jQuery
import $ from 'jquery';
// 导入store
import store from '@/store';
// 导入API基础URL
import { API_BASE_URL } from '@/config/api';

// API端点URL
const UPDATE_PASSWORD_URL = `${API_BASE_URL}/user/updatePassword`
const UPDATE_PHOTO_URL = `${API_BASE_URL}/user/updateAvatar`
const DELETE_POST_BY_POSTID = `${API_BASE_URL}/posts/delete/`
const USER_INFO_URL = `${API_BASE_URL}/user/find`
const UPDATE_USER_INFO_URL = `${API_BASE_URL}/user/updateInfo` // 新增的API端点

/**
 * 更新用户基本信息
 * @param {Object} userData - 用户数据对象
 * @param {string} userData.userId - 用户ID
 * @param {string} userData.location - 用户所在地
 * @param {string} userData.bio - 用户简介
 * @returns {Promise} - 返回更新结果的Promise
 */
export function updateUserInfo(userData) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: UPDATE_USER_INFO_URL,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      contentType: 'application/json',
      data: JSON.stringify({
        id: userData.id,
        location: userData.location,
        bio: userData.bio
      }),
      success: function(response) {
        if (response.success === true) {
          resolve(response);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '更新用户信息失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('更新用户信息失败:', error);
        reject({
          code: xhr.status,
          message: error || '更新用户信息失败'
        });
      }
    });
  });
}

/**
 * 修改用户密码
 * @param {Object} passwordData - 包含当前密码和新密码的对象
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回修改结果的Promise
 */
export function updateUserPassword(passwordData, userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${UPDATE_PASSWORD_URL}`,
      type: 'POST',
      headers: {
          Authorization: "Bearer " + store.state.user.token,
        },
      contentType: 'application/json',
      data: JSON.stringify({
        userId: userId,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }),
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
 * 更新用户头像
 * @param {FormData} formData - 包含头像文件的FormData对象
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回更新结果的Promise
 */
export function updateAvatar(formData, userId) {
  // 确保formData中包含userId
  formData.append('userId', userId);

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${UPDATE_PHOTO_URL}`,
      type: 'POST',
      data: formData,
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      processData: false, // 不处理数据
      contentType: false, // 不设置内容类型
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
 * 删除用户帖子
 * @param {string} postId - 帖子ID
 * @returns {Promise} - 返回删除结果的Promise
 */
export function deleteUserPost(postId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${DELETE_POST_BY_POSTID}`+postId,
      type: 'DELETE',
      data: {
        postId: postId,
      },
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

export function getUserInfo(userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${USER_INFO_URL}/${userId}`,
      type: 'GET',
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
 * 发送邮箱验证码
 * @param {Object} data - 验证码请求数据
 * @param {string} data.email - 用户邮箱
 * @param {string} data.userId - 用户ID
 * @returns {Promise} - 返回发送结果的Promise
 */
export function sendVerificationCode(data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_BASE_URL}/mail/sendVerificationCode`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      contentType: 'application/json',
      data: JSON.stringify({
        email: data.email
      }),
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error.responseJSON || { error_msg: '验证码发送失败' });
      }
    });
  });
}

/**
 * 更新用户邮箱
 * @param {Object} data - 邮箱更新数据
 * @param {string} data.userId - 用户ID
 * @param {string} data.email - 新邮箱
 * @param {string} data.verificationCode - 验证码
 * @returns {Promise} - 返回更新结果的Promise
 */
export function updateEmail(data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_BASE_URL}/user/updateEmail`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      contentType: 'application/json',
      data: JSON.stringify({
        id: data.id,
        newEmail: data.newEmail,
        verificationCode: data.verificationCode
      }),
      success: function(response) {
        resolve(response);
      },
      error: function(error) {
        reject(error.responseJSON || { error_msg: '邮箱更新失败' });
      }
    });
  });
}

/**
 * 显示操作消息
 * @param {Object} messageObj - 消息对象
 * @param {string} text - 消息文本
 * @param {string} type - 消息类型 (success/warning/danger)
 * @returns {void}
 */
export function showMessage(messageObj, text, type = 'success') {
  messageObj.show = true;
  messageObj.text = text;
  messageObj.type = type;
  
  setTimeout(() => {
    messageObj.show = false;
  }, 3000);
}
