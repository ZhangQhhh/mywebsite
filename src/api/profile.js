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
const USER_INFO_URL = `${API_BASE_URL}/user/find`;
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