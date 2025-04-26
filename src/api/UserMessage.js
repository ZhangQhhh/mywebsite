/**
 * 用户消息和关注相关的API服务
 */

import $ from 'jquery';
import store from '@/store';
import { API_ENDPOINTS } from '@/config/api';

/**
 * 获取用户统计信息（发帖数、关注数、粉丝数）
 * @param {string|number} userId - 用户ID
 * @returns {Promise} 返回统计信息的Promise
 */
export function getUserStats(userId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${API_ENDPOINTS.USER.STATS}/${userId}`,
            type: 'GET',
            headers: {
                Authorization: "Bearer " + store.state.user.token
            },
            success: function(response) {
                resolve(response);
            },
            error: function(error) {
                console.error('获取用户统计信息失败:', error);
                reject(error);
            }
        });
    });
}

/**
 * 关注/取消关注用户
 * @param {string|number} targetUserId - 目标用户ID
 * @param {boolean} isFollow - true为关注，false为取消关注
 * @returns {Promise}
 */
export function toggleFollow(targetUserId, isFollow,currentUserId) {
    const url = isFollow ? API_ENDPOINTS.USER.FOLLOW : API_ENDPOINTS.USER.UNFOLLOW;
    
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${url}/${targetUserId}/${currentUserId}`,
            type: 'GET',
            headers: {
                Authorization: "Bearer " + store.state.user.token
            },
            success: function(response) {
                resolve(response);
            },
            error: function(error) {
                console.error(`${isFollow ? '关注' : '取消关注'}用户失败:`, error);
                reject(error);
            }
        });
    });
}

/**
 * 检查是否已关注某用户
 * @param {string|number,string|number} targetUserId,currentUserId - 目标用户ID
 * @returns {Promise}
 * 检查targetUserId 是否关注了 currentUserId
 */
export function checkFollowStatus(targetUserId,currentUserId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${API_ENDPOINTS.USER.CHECK_FOLLOW}/${targetUserId}/${currentUserId}`,
            type: 'GET',
            success: function(response) {
                resolve(response);
            },
            error: function(error) {
                console.error('检查关注状态失败:', error);
                reject(error);
            }
        });
    });
}
