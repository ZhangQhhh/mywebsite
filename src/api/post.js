/**
 * 帖子和分类相关的API服务
 */

// 导入jQuery
import $ from 'jquery';
// 导入API基础URL
import { API_BASE_URL } from '@/config/api';

// 帖子相关API的基础URL
const POST_API_URL = `${API_BASE_URL}/posts/addPost`;
// 分类相关API的基础URL
const CATEGORY_API_URL = `${API_BASE_URL}/posts/addPostPage/`;
const POST_GET_API_URL = `${API_BASE_URL}/posts/detail`;
const POST_GET_LIST_API_URL = `${API_BASE_URL}/posts/detail/list`;
const USER_POSTS_API_URL = `${API_BASE_URL}/user/posts/detail/list`;
// 七牛云上传API的URL
const QINIU_UPLOAD_URL = `${API_BASE_URL}/image/upload`;
const POST_UPDATE_URL = `${API_BASE_URL}/posts/update`;
/**
 * 获取帖子列表
 * @param {Object} params - 查询参数，如页码、分类等
 * @returns {Promise} - 返回帖子列表的Promise
 */
export function getPostList(params = {}) {

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_GET_LIST_API_URL}`,
      type: 'GET',
      data: params,
      success: function(response) {
        if(response.error_msg === 'success'){
          resolve(response);
        }
      },
      error: function(xhr, status, error) {
        console.error('获取帖子列表失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取帖子列表失败'
        });
      }
    });
  });
}

/**
 * 获取当前登录用户的帖子列表
 * @param {Object,Integer} params|userId  - 查询参数 用户id，如页码等
 * @returns {Promise} - 返回用户帖子列表的Promise
 */
export function getUserPosts(params={}, userId) {

  return new Promise((resolve, reject) => {
    // 获取最新的token，先从 store 中获取，如果不存在则从 localStorage 中获取
    let token = store.state.user.token;
    if (!token) {
      token = localStorage.getItem('jwt_token');
      if (token) {
        // 如果从 localStorage 中获取到了 token，更新到 store 中
        store.commit('updateToken', token);
      }
    }

    // 如果没有 token 或 userId，直接返回错误
    if (!token || !userId) {
      console.error('获取用户帖子列表失败: 缺少 token 或 userId');
      reject({
        code: 401,
        message: '请先登录后再试'
      });
      return;
    }

    $.ajax({
      url: `${USER_POSTS_API_URL}/${userId}`,
      type: 'GET',
      data: params,
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function(response) {
        if(response.error_msg === 'success'){
          resolve(response);
        } else {
          reject({
            code: 400,
            message: response.error_msg || '获取用户帖子列表失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('获取用户帖子列表失败:', error);
        reject({
          code: xhr.status,
          message: error || '获取用户帖子列表失败'
        });
      }
    });
  });
}


/**
 * 获取帖子详情
 * @param {number|string} id - 帖子ID
 * @returns {Promise} - 返回帖子详情的Promise
 */
export function getPostDetail(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_GET_API_URL}/${id}`,
      type: 'GET',
      dataType: 'json',
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        reject({
          code: xhr.status,
          message: error || '获取帖子详情失败'
        });
      }
    });
  });
}




// 导入store
import store from '@/store';

/**
 * 创建新帖子
 * @param {Object} postData - 帖子数据
 * @returns {Promise} - 返回创建结果的Promise
 */
export function createPost(postData) {

  return new Promise((resolve, reject) => {
    $.ajax({
      url: POST_API_URL,
      type: 'POST',
      data: JSON.stringify(postData), // 使用 JSON.stringify 将数据转换为 JSON 字符串
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      dataType: 'json',
      crossDomain: true, // 明确指定跨域请求
      xhrFields: {
        withCredentials: true // 发送凭证，解决会话问题
      },
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        console.error('创建帖子失败:', error);
        reject({
          code: xhr.status,
          message: error || '创建帖子失败'
        });
      }
    });
  });
}


/**
 * 更新帖子
 * @param {number|string} id - 帖子ID
 * @param {Object} postData - 更新的帖子数据
 * @returns {Promise} - 返回更新结果的Promise
 */
export function updatePost(id, postData) {

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_UPDATE_URL}/${id}`,
      type: 'PUT',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      dataType: 'json',
      success: function(response) {
        if (response.error_msg === 'success') {
          resolve(response);
        } else {
          // 处理业务逻辑错误
          reject({
            code: 400,
            message: response.error_msg || '更新帖子失败'
          });
        }
      },
      error: function(xhr, status, error) {
        console.error('更新帖子失败:', error);
        reject({
          code: xhr.status,
          message: error || '更新帖子失败'
        });
      }
    });
  });
}


/**
 * 删除帖子
 * @param {number|string} id - 帖子ID
 * @returns {Promise} - 返回删除结果的Promise
 */
export function deletePost(id) {

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_API_URL}/${id}`,
      type: 'DELETE',
      dataType: 'json',
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        console.error('删除帖子失败:', error);
        reject({
          code: xhr.status,
          message: error || '删除帖子失败'
        });
      }
    });
  });
}


/**
 * 点赞帖子
 * @param {string|number} postId - 帖子ID
 * @returns {Promise} 返回点赞操作的结果
 */
export function likePost(postId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_GET_API_URL}/${postId}/like`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        reject({
          code: xhr.status,
          message: error || '点赞操作失败'
        });
      }
    });
  });
}

/**
 * 收藏帖子
 * @param {string|number} postId - 帖子ID
 * @returns {Promise} 返回收藏操作的结果
 */
export function collectPost(postId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_GET_API_URL}/${postId}/collect`,
      type: 'POST',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        reject({
          code: xhr.status,
          message: error || '收藏操作失败'
        });
      }
    });
  });
}


/**
 * 获取所有分类
 * @returns {Promise} - 返回分类列表的Promise
 */
export function getCategories() {

  return new Promise((resolve) => {
    $.ajax({
      url: CATEGORY_API_URL,
      type: 'GET',
      dataType: 'json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if(response.error_msg === 'success'){
           resolve(response.data || response);
        }

      },
      error: function(xhr, status, error) {
        console.error('获取分类失败: ', error.error_msg);
        // 如果API暂未实现，返回默认分类
        resolve([
          { id: '1', name: '提问' },
          { id: '2', name: '分享' },
          { id: '3', name: '建议' },
          { id: '4', name: '讨论' }
        ]);
      },
    });
  });
}

/**
 * 上传图片到七牛云OSS
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} - 返回上传结果的Promise，成功时返回图片URL
 */
export function uploadImage(file) {

  // 创建FormData对象，用于发送文件
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    $.ajax({
      url: QINIU_UPLOAD_URL,
      type: 'POST',
      data: formData,
      processData: false, // 不处理数据
      contentType: false, // 不设置内容类型
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        if(response.success === true){
            // 假设后端返回的数据中包含图片URL
          if (response && response.downloadUrl) {
            resolve(response.downloadUrl);
          } else {
            reject({
              code: 500,
              message: '上传成功但未返回图片URL'
            });
          }
        }
      },
      error: function(xhr, status, error) {
        console.error('图片上传失败:', error);
        reject({
          code: xhr.status,
          message: error || '图片上传失败'
        });
      }
    });
  });
}

/**
 * 增加帖子阅读量
 * @param {number|string} id - 帖子ID
 * @returns {Promise} - 返回更新结果的Promise
 */
export function increasePostViews(id) {

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${POST_GET_API_URL}/${id}/views`,
      type: 'POST',
      dataType: 'json',
      headers: {
        Authorization: "Bearer " + store.state.user.token,
      },
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        reject({
          code: xhr.status,
          message: error || '增加阅读量失败'
        });
      }
    });
  });
}
