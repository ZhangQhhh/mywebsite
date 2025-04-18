/**
 * API服务入口文件
 * 统一导出所有API服务
 */

// 导入各个模块的API
import * as postApi from './post';
import * as profileApi from './profile';
import * as commentApi from './comment';

// 导出API
export const post = postApi;
export const profile = profileApi;
export const comment = commentApi;

// 可以在这里添加全局的API拦截器、错误处理等

// 导出默认API对象
export default {
  post,
  profile,
  comment
};