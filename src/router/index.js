import { createRouter, createWebHistory } from 'vue-router'
import { showAlert } from '@/utils'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import RigisterView from '@/views/RigisterView.vue'
import UserListView from '@/views/UserListView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import TestMarView from '@/views/TestMarView.vue'
import MarkdownEditorView from '@/views/MarkdownEditorView.vue'
import TestMarkShow from '@/views/testMarkShow.vue'
import PostCreateView from '@/views/PostCreateView.vue'
import PostView from '@/views/PostView.vue'
import PostEditView from '@/views/PostEditView.vue'
import AdminControlView from '@/views/AdminControlView.vue'
import store from '../store/index'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/userlist',
    name: 'userlist',
    component: UserListView,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/userprofile',
    name: 'userprofile',
    component: UserProfileView,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/login',
    name: 'login', //  用名字跳转
    component: LoginView
  },
  {
    path: '/rigister',
    name: 'rigister',
    component: RigisterView
  },
  {
    path: '/mark',
    name: 'mark',
    component: TestMarView
  },
  {
    path: '/markdown-editor',
    name: 'markdown-editor',
    component: MarkdownEditorView,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/test-markshow',
    name: 'test-markshow',
    component: TestMarkShow
  },
  {
    path: '/post/create',
    name: 'post-create',
    component: PostCreateView,
    meta: {
      requestAuth: true,   // 是否需要授权
    }
  },
  {
    path: '/post/edit/:id',
    name: 'post-edit',
    component: PostEditView,
    props:true,
    meta: {
      requestAuth: true,   // 是否需要授权
    }
  },
  {
    path: '/post/:id',
    name: 'post-view',
    component: PostView,
    props: true,
    meta: {
      requestAuth: false,  // 不需要授权即可查看帖子
    }
  },
  // {
  //   path: '/CommentTestView',
  //   name: 'CommentTestView',
  //   component: CommentTestView
  // },
  {
    path: '/admin',
    name: 'admin',
    component: AdminControlView,
    meta: {
      requestAuth: true,   // 需要授权
      // 注意：实际的管理员权限控制应该在后端完成
      // 前端路由只是一个基本的保护层
    }
  },

  {
    path: '/404',
    name: '404',
    component: NotFoundView
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404/"
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
    // 检查是否有token
    const jwt_token = localStorage.getItem("jwt_token");

    // 如果有token，尝试获取用户信息
    if (jwt_token) {
      // 更新token到store
      store.commit("updateToken", jwt_token);

      // 如果用户还没有登录，尝试获取用户信息
      if (!store.state.user.is_login) {
        try {
          // 使用Promise包装dispatch，使其可以等待
          await new Promise((resolve, reject) => {
            store.dispatch("getinfo", {
              success() {
                resolve();
              },
              error() {
                reject();
              }
            });
          });
        } catch (error) {
          // 获取用户信息失败，token无效
          showAlert("token无效，请重新登录！");
          localStorage.removeItem('jwt_token');
          store.commit("logout");

          // 如果要访问的页面需要登录，重定向到登录页
          if (to.meta.requestAuth) {
            next({ name: 'login' });
            return;
          }
        }
      }
    }

    // 如果要访问的页面需要登录但用户未登录
    if (to.meta.requestAuth && !store.state.user.is_login) {
      showAlert("请先进行登录！");
      next({ name: "login" });
      return;
    }

    // 其他情况允许访问
    next();
})

export default router
