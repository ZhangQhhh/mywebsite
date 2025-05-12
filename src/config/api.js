export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
export const WS_URL = process.env.VUE_APP_WS_URL;
export const WS_API_BASE_URL = process.env.NODE_ENV === 'production' ? '/websocket' : 'http://localhost:3000/websocket';

// 定义所有API端点
export const API_ENDPOINTS = {
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users`,
    BAN: `${API_BASE_URL}/admin/ban`,
    UNBAN: `${API_BASE_URL}/admin/unban`,
    RESET_PASSWORD: `${API_BASE_URL}/admin/resetPassword`,
  },
  USER: {
    LOGIN: `${API_BASE_URL}/user/account/token/`,
    REGISTER: `${API_BASE_URL}/user/account/register/`,
    INFO: `${API_BASE_URL}/user/account/info/`,
    UPDATE_PASSWORD: `${API_BASE_URL}/user/updatePassword`,
    UPDATE_AVATAR: `${API_BASE_URL}/user/updateAvatar`,
    UPDATE_INFO: `${API_BASE_URL}/user/updateInfo`,
    STATS: `${API_BASE_URL}/user/stats`,
    FOLLOW: `${API_BASE_URL}/user/follow`,
    UNFOLLOW: `${API_BASE_URL}/user/unfollow`,
    CHECK_FOLLOW: `${API_BASE_URL}/follow/check`,
  },
  POST: {
    BASE: `${API_BASE_URL}/posts`,
    ADD: `${API_BASE_URL}/posts/addPost`,
    DELETE: `${API_BASE_URL}/posts/delete/`,
    DETAIL: `${API_BASE_URL}/posts/detail`,
  },
  COMMENT: {
    BASE: `${API_BASE_URL}/comments`,
    LIST: `${API_BASE_URL}/comments/get`,
    ADD: `${API_BASE_URL}/comments/add`,
    REPLY: `${API_BASE_URL}/comments/reply`,
    DELETE: `${API_BASE_URL}/comments/delete`,
    LIKE: `${API_BASE_URL}/comments/like`,
    UNLIKE: `${API_BASE_URL}/comments/unlike`,
  },
  FOLLOWS:{
    BASE: `${API_BASE_URL}/follow`,
    FOLLOWERS: `${API_BASE_URL}/follow/select/followers`,
    FOLLOWINGS: `${API_BASE_URL}/follow/select/followings`,
  },
  MESSAGE:{
    BASE: `${WS_API_BASE_URL}/messages`,
    LIST: `${WS_API_BASE_URL}/messages/list`,
    DETAIL: `${WS_API_BASE_URL}/messages/history`,
    SEND: `${WS_API_BASE_URL}/messages/send`,
    READ: `${WS_API_BASE_URL}/messages/read`,
    DELETE: `${WS_API_BASE_URL}/messages/delete`,
  }
};





