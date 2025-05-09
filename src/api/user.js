/**
 * 用户相关的API服务
 */

// 导入jQuery
import $ from 'jquery';
// 导入store
import store from '@/store';
// 导入API基础URL
import { API_BASE_URL } from '@/config/api';
import { API_ENDPOINTS } from '@/config/api';

// API端点URL
const USER_INFO_URL = `${API_BASE_URL}/user/info`;
const FOLLOW_USER_URL = `${API_BASE_URL}/user/follow`;
const UNFOLLOW_USER_URL = `${API_BASE_URL}/user/unfollow`;
const USER_STATS_URL = `${API_BASE_URL}/user/stats`;
const FOLLOWERS = API_ENDPOINTS.FOLLOWS.FOLLOWERS;
const FOLLOWINGS = API_ENDPOINTS.FOLLOWS.FOLLOWINGS;

/**
 * 获取用户粉丝列表
 * @param {string|number} userId 
 * @returns 
 */
export function getFollowers(userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${FOLLOWERS}/${userId}`,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if (response.success === true) {
          resolve(response);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '获取粉丝列表失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('获取粉丝列表失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取粉丝列表失败'
        });
      }
    });
  });
}
/**
 * 获取关注列表
 * @param {string|number} userId 
 * @returns 
 */
export function getFollowings(userId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${FOLLOWINGS}/${userId}`,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if (response.success === true) {
          resolve(response);
        } else {
          reject({
            code: 400,  // 400表示客户端错误
            message: response.error_msg || '获取关注列表失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('获取关注列表失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取关注列表失败'
        });
      }
    });
  });
}




/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回用户信息的Promise
 */
export function getUserInfo(userId) {
  return new Promise((resolve, reject) => {
    // 获取token
    let token = store.state.user.token;
    if (!token) {
      token = localStorage.getItem('jwt_token');
      if (token) {
        store.commit('updateToken', token);
      }
    }

    $.ajax({
      url: `${USER_INFO_URL}/${userId}`,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function(response) {
        if (response.error_msg === 'success') {
          resolve(response.user);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '获取用户信息失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('获取用户信息失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取用户信息失败'
        });
      }
    });
  });
}

/**
 * 获取用户统计信息（帖子数、关注数、粉丝数）
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回用户统计信息的Promise
 */
export function getUserStats(userId) {
  return new Promise((resolve, reject) => {
    let token = store.state.user.token;
    if (!token) {
      token = localStorage.getItem('jwt_token');
      if (token) {
        store.commit('updateToken', token);
      }
    }

    $.ajax({
      url: `${USER_STATS_URL}/${userId}`,
      type: 'GET',
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function(response) {
        if (response.error_msg === 'success') {
          resolve(response.stats);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '获取用户统计信息失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('获取用户统计信息失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取用户统计信息失败'
        });
      }
    });
  });
}

/**
 * 关注用户
 * @param {string} targetUserId - 要关注的用户ID
 * @returns {Promise} - 返回关注结果的Promise
 */
export function followUser(targetUserId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: FOLLOW_USER_URL,
      type: 'POST',
      data: JSON.stringify({
        targetUserId: targetUserId
      }),
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if (response.error_msg === 'success') {
          resolve(response);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '关注用户失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('关注用户失败:', error);
        reject({
          code: xhr.status,
          message: error || '关注用户失败'
        });
      }
    });
  });
}

/**
 * 取消关注用户
 * @param {string} targetUserId - 要取消关注的用户ID
 * @returns {Promise} - 返回取消关注结果的Promise
 */
export function unfollowUser(targetUserId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: UNFOLLOW_USER_URL,
      type: 'POST',
      data: JSON.stringify({
        targetUserId: targetUserId
      }),
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if (response.error_msg === 'success') {
          resolve(response);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '取消关注用户失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('取消关注用户失败:', error);
        reject({
          code: xhr.status,
          message: error || '取消关注用户失败'
        });
      }
    });
  });
} 