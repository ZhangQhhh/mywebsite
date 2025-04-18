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
            <a class="nav-link" >{{ $store.state.user.username }}</a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'rigister' }">注册</router-link>
          </li>


          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              工具箱
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" :to="{ name: 'mark' }">简易编辑器</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'markdown-editor' }">Markdown编辑器</router-link></li>
              <li><router-link class="dropdown-item" :to="{name:'post-create'}">发帖</router-link></li>

              <li v-if="$store.state.user.role === 'ADMIN'"><router-link class="dropdown-item" :to="{name:'admin'}">管理界面</router-link></li>
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
              <li><router-link class="dropdown-item" :to="{ name: 'mark' }">简易编辑器</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'markdown-editor' }">Markdown编辑器</router-link></li>
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
import { onMounted } from 'vue';

export default {
  name: "NavBar",
  setup(){
    const store = useStore();
    const logout = () => {
      store.dispatch("logout");
    }

    // 在组件挂载后确保Bootstrap下拉菜单正常工作
    onMounted(() => {
      // Bootstrap已在main.js中全局导入，这里不需要重复导入
      // 只需确保下拉菜单功能正常工作
    });

    return {
      logout,
    }
  }
}

</script>

<style scoped>
.logo {
  /* border-radius: 50%; */
}
</style>