<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <router-link class="navbar-brand" :to="{ name: 'home' }">
        <img src="../assets/mylogo.png" alt="Logo" width="30" height="24" class="d-inline-block align-text-top logo">
        研究星球
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
        aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarText">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link active" :to="{ name: 'home' }">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'userlist' }">社区动态</router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'userprofile' }">个人设置</router-link>
          </li>
        </ul>


        <ul class="navbar-nav " v-if="$store.state.user.is_login">

          <li class="nav-item">
            <router-link 
              class="nav-link username-link user-profile-entry" 
              :to="{name: 'UserDesc',params:{userId:$store.state.user.id}}" 
              data-bs-toggle="tooltip" 
              data-bs-placement="bottom" 
              title="点击进入个人主页"
            >
              <img :src="$store.state.user.photo || require('../assets/mylogo.png')" alt="头像" class="navbar-avatar me-2" />
              <span class="username-text">{{ $store.state.user.username }}</span>
              <span class="profile-link-icon ms-2">
                <i class="bi bi-box-arrow-up-right"></i>
              </span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'pmessage' }">私信列表</router-link>
          </li> 


          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              工具箱
            </a>
            <ul class="dropdown-menu">
              <!-- <li><router-link class="dropdown-item" :to="{ name: 'mark' }">简易编辑器</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'markdown-editor' }">Markdown编辑器</router-link></li> -->
              <li><router-link class="dropdown-item" :to="{name:'post-create'}">发帖</router-link></li>
              <li>
                <a class="dropdown-item" @click="handleAIClick">
                  AI助手
                  <span class="vip-badge" title="VIP功能">
                    <i class="fas fa-crown" style="color: #FFD700;"></i>
                  </span>
                </a>
              </li>
              <li v-if="$store.state.user.role === 'ADMIN'">
                <router-link class="dropdown-item" :to="{name:'admin'}">管理界面</router-link>
              </li>
              <li><a class="dropdown-item" v-on:click="logout">退出账号</a></li>
            </ul>
          </li>

        </ul>

        <ul class="navbar-nav " v-else>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'login' }">登录</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'rigister' }">注册</router-link>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              工具箱
            </a>
            <ul class="dropdown-menu">
              <!-- <li><router-link class="dropdown-item" :to="{ name: 'mark' }">简易编辑器</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'markdown-editor' }">Markdown编辑器</router-link></li> -->
              <li><router-link class="dropdown-item" :to="{ name: 'post-create' }">发帖</router-link></li>

            </ul>
          </li>

        </ul>


      </div>
    </div>
  </nav>
</template>

<script>
import {useStore} from 'vuex';
import { useRouter } from 'vue-router';
import {showAlert } from '@/utils';
import { UToast } from 'undraw-ui'

export default {
  name: "NavBar",
  setup(){
    const store = useStore();
    const router = useRouter();
    
    const logout = () => {
      store.dispatch("logout");
    }
    
    // 添加处理AI助手点击的方法
    const handleAIClick = () => {
      const isVip = store.state.user.vip === '1' || 
                    store.state.user.vip === 1 || 
                    store.state.user.vip === true;
      if (isVip) {
        router.push('/ai');
      } else {
        try {
          UToast({ message: '该功能仅对VIP会员开放！请升级为VIP会员后再访问。', type: 'error',duration:'3000' })
        } catch (error) {
          console.error('显示确认对话框时发生错误:', error);
          showAlert("该功能仅对VIP会员开放！请升级为VIP会员后再访问。");
        }
      }
    }

    return {
      logout,
      handleAIClick
    }
  },
  mounted() {
    // 初始化所有工具提示
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl));
  }
}

</script>

<style scoped>
.logo {
  /* border-radius: 50%; */
}

.vip-badge {
  margin-left: 5px;
  font-size: 0.9em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.username-link {
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.username-link:hover {
  color: #007bff;
}

/* 添加一个微小的动画效果 */
.username-link:hover .bi-box-arrow-up-right {
  transform: translateX(2px) translateY(-2px);
}

.bi-box-arrow-up-right {
  transition: transform 0.2s ease;
}

.navbar-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(99,102,241,0.10);
  border: 2px solid #e0e7ff;
  background: #f3f4f6;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.user-profile-entry {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.9rem 0.2rem 0.5rem;
  border-radius: 2rem;
  transition: background 0.2s, box-shadow 0.2s;
  position: relative;
}
.user-profile-entry:hover {
  background: linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%);
  box-shadow: 0 4px 16px rgba(99,102,241,0.10);
}
.username-text {
  font-weight: 600;
  color: #3730a3;
  font-size: 1.08rem;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}
.user-profile-entry:hover .username-text {
  color: #4f46e5;
}
.profile-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #6366f1;
  font-size: 1.1rem;
  margin-left: 0.2rem;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.user-profile-entry:hover .profile-link-icon {
  background: #6366f1;
  color: #fff;
  transform: translateX(2px) scale(1.08);
}
</style>
