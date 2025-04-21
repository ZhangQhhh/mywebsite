import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.css';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import UndrawUi from 'undraw-ui';
import 'undraw-ui/dist/style.css';
import { message, showAlert, showConfirm } from './utils';
import consoleBlocker from './plugins/consoleBlocker';

// 手动将Bootstrap挂载到window对象
window.bootstrap = bootstrap;

// 确保Bootstrap正确加载
// console.log('Bootstrap加载状态:', {
//   bootstrap: !!bootstrap,
//   Modal: !!(bootstrap && bootstrap.Modal)
// });

// 创建应用实例
const app = createApp(App);

// 注册全局属性
app.config.globalProperties.$message = message;
app.config.globalProperties.$alert = showAlert;
app.config.globalProperties.$confirm = showConfirm;

// 确保全局属性正确注册
// console.log('全局属性注册状态:', {
//   $message: !!message,
//   $alert: !!showAlert,
//   $confirm: !!showConfirm
// });

// 挂载应用
app.use(store)
   .use(mavonEditor)
   .use(ElementPlus)
   .use(UndrawUi)
   .use(router)
   .use(consoleBlocker, {
     // 控制台屏蔽插件的配置选项
     debug: false // 是否保留错误日志
   })
   .mount('#app')

// 添加在现有代码中
// console.log('Current API URL:', process.env.VUE_APP_API_BASE_URL);
