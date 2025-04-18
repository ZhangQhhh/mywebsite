export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

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
};

