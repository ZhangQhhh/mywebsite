/**
 * 控制台日志屏蔽插件
 * 在生产环境中屏蔽所有控制台输出
 */

// 创建空函数
// 使用命名函数而不是匿名函数，避免构建问题
function noop() {}

export default {
  install(app, options) {
    // 只在生产环境中屏蔽控制台输出
    if (process.env.NODE_ENV === 'production') {
      // 将原始控制台对象保存到全局变量
      window._originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
      };

      // 将控制台方法替换为空函数
      console.log = noop;
      console.error = noop;
      console.warn = noop;
      console.info = noop;
      console.debug = noop;

      // 将原始控制台挂载到应用实例上
      app.config.globalProperties.$console = window._originalConsole;

      // 添加一个全局方法用于重要错误
      window.logCriticalError = function(message) {
        if (window._originalConsole) {
          window._originalConsole.error('[CRITICAL]', message);
        }
      };

      // 使用options参数来配置插件行为
      if (options && options.debug === true) {
        // 如果开启debug模式，则保留错误日志
        console.error = window._originalConsole.error;
      }
    }
  }
};
