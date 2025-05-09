/**
 * 评论相关的API服务
 */

// 导入jQuery
import $ from 'jquery';
// 导入store
import store from '@/store';
import { API_ENDPOINTS } from '@/config/api';

/**
 * 获取评论列表
 * @param {Object} params - 查询参数
 * @param {string|number} contentId - 内容ID
 * @returns {Promise} - 返回评论列表的Promise
 */
export function getCommentList(params, contentId) {
  console.log(`调用获取评论列表API，参数:`, params, `内容ID:`, contentId);
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_ENDPOINTS.COMMENT.LIST}/${contentId}`,
      type: 'GET',
      data: params,
      success: function(response) {
        console.log(`获取评论列表API响应:`, response);
        resolve(response);
      },
      error: function(error) {
        console.error(`获取评论列表API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 添加评论
 * @param {Object} commentData - 评论数据
 * @returns {Promise} - 返回添加结果的Promise
 */
export function addComment(commentData) {
  return new Promise((resolve, reject) => {
    if (!store.state.user.token) {
      reject(new Error('请先登录'));
      return;
    }

    $.ajax({
      url: API_ENDPOINTS.COMMENT.ADD,
      type: 'POST',
      data: JSON.stringify(commentData),
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        console.log(`添加评论API响应:`, response);
        resolve(response);
      },
      error: function(error) {
        console.error(`添加评论API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 回复评论
 * @param {Object} replyData - 回复数据
 * @returns {Promise} - 返回回复结果的Promise
 */
export function replyComment(replyData) {
  return new Promise((resolve, reject) => {
    if (!store.state.user.token) {
      reject(new Error('请先登录'));
      return;
    }

    $.ajax({
      url: API_ENDPOINTS.COMMENT.REPLY,
      type: 'POST',
      data: JSON.stringify(replyData),
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token
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

/**
 * 删除评论
 * @param {string|number} commentId - 评论ID
 * @returns {Promise} - 返回删除结果的Promise
 */
export function deleteComment(commentId) {
  console.log(`调用删除评论API，评论ID:`, commentId);
  return new Promise((resolve, reject) => {
    if (!store.state.user.token) {
      reject(new Error('请先登录'));
      return;
    }

    $.ajax({
      url: `${API_ENDPOINTS.COMMENT.DELETE}/${commentId}`,
      type: 'DELETE',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        console.log(`删除评论API响应:`, response);
        resolve(response);
      },
      error: function(error) {
        console.error(`删除评论API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 点赞评论
 * @param {string|number} commentId - 评论ID
 * @returns {Promise} - 返回点赞结果的Promise
 */
export function likeComment(commentId) {
  console.log(`调用点赞评论API，评论ID:`, commentId);
  return new Promise((resolve, reject) => {
    if (!store.state.user.token) {
      reject(new Error('请先登录'));
      return;
    }

    $.ajax({
      url: `${API_ENDPOINTS.COMMENT.LIKE}/${commentId}`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      success: function(response) {
        console.log(`点赞评论API响应:`, response);
        resolve(response);
      },
      error: function(error) {
        console.error(`点赞评论API错误:`, error);
        reject(error);
      }
    });
  });
}

/**
 * 取消点赞评论
 * @param {string|number} commentId - 评论ID
 * @returns {Promise} - 返回取消点赞结果的Promise
 */
export function unlikeComment(commentId) {
  console.log(`调用取消点赞评论API，评论ID:`, commentId);
  return new Promise((resolve, reject) => {
    if (!store.state.user.token) {
      reject(new Error('请先登录'));
      return;
    }

    $.ajax({
      url: `${API_ENDPOINTS.COMMENT.UNLIKE}/${commentId}`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token
      },
      xhrFields: { withCredentials: true },
      success: function(response) {
        console.log(`取消点赞评论API响应:`, response);
        resolve(response);
      },
      error: function(error) {
        console.error(`取消点赞评论API错误:`, error);
        reject(error);
      }
    });
  });

  
}
export function searchUsers (){
  console.log(`调用搜索用户API`);
}
// 更新导出对象
export const commentApi = {
  getCommentList,
  addComment,
  replyComment,
  deleteComment,
  likeComment,
  unlikeComment,
  searchUsers
};

// 默认导出
export default commentApi;



