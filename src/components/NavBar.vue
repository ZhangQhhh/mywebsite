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
            <router-link class="nav-link" :to="{ name: 'userprofile' }">我的笔记</router-link>
          </li>
        </ul>


        <ul class="navbar-nav " v-if="$store.state.user.is_login">

          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'UserDesc',params:{userId:$store.state.user.id}}" >{{ $store.state.user.username }}</router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'rigister' }">注册</router-link>
          </li> -->


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
// getCurrentInstance
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {showAlert } from '@/utils';
import { UToast } from 'undraw-ui'

export default {
  name: "NavBar",
  setup(){
    const store = useStore();
    const router = useRouter();
    // const { proxy } = getCurrentInstance();
    
    const logout = () => {
      store.dispatch("logout");
    }
    
    // 添加处理AI助手点击的方法
    const handleAIClick = () => {
      const isVip = store.state.user.is_vip === '1' || 
                    store.state.user.is_vip === 1 || 
                    store.state.user.is_vip === true;
      
      if (isVip) {
        router.push({name: 'ChatView'});
      } else {
        try {
          // if (proxy && proxy.$confirm) {
          //   proxy.$confirm(
          //     '该功能仅对VIP会员开放，是否立即升级为VIP会员？', 
          //     '友情提示', 
          //     (confirmed) => {
          //       if (confirmed) {
          //         router.push({name: 'userprofile'});
          //       }
          //       // 移除 else 块，不需要对取消操作做特殊处理
          //     }
          //   );
          // } else {
          //   showAlert("该功能仅对VIP会员开放！请升级为VIP会员后再访问。");
          // }
          UToast({ message: '该功能仅对VIP会员开放！请升级为VIP会员后再访问。', type: 'error',duration:'3000' })
        } catch (error) {
          console.error('显示确认对话框时发生错误:', error);
          showAlert("该功能仅对VIP会员开放！请升级为VIP会员后再访问。");
        }
      }
    }

    // 在组件挂载后确保Bootstrap下拉菜单正常工作
    onMounted(() => {
      // Bootstrap已在main.js中全局导入，这里不需要重复导入
      // 只需确保下拉菜单功能正常工作
    });

    return {
      logout,
      handleAIClick
    }
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
</style>
