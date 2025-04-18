<template>
    <Content>
      <div class="row">
        <div class="col-4">
          <UserProfileInfo v-on:follow="follow" v-on:unfollow="unfollow" v-bind:user="user"/>
          <!-- <UserProfileWrite v-on:post_a_post="post_a_post" /> -->
          <UserProfileSettings v-bind:user="user" />
        </div>
        <div class="col-8">
          <UserProfilePosts
            v-bind:posts="posts"
            v-bind:loading="loading"
            v-bind:error="error"
            v-bind:errorMessage="errorMessage"
            v-bind:currentPage="currentPage"
            v-bind:totalPages="totalPages"
            v-bind:displayedPages="displayedPages"
            @change-page="changePage"
          />
        </div>
      </div>
    </Content>
  </template>

  <script>
  // @ is an alias to /src
  import Content from '@/components/ContentBase';
  import UserProfileInfo from '@/components/UserProfileInfo'
  import UserProfilePosts from '@/components/UserProfilePosts'
  // import UserProfileWrite from '@/components/UserProfileWrite';
  import UserProfileSettings from '@/components/UserProfileSettings.vue';
  import { reactive, ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { getUserPosts } from '@/api/post';
  export default {
    name:"UserProfileView",
    components:{
      Content,
      UserProfileInfo,
      UserProfilePosts,
      // UserProfileWrite,
      UserProfileSettings
    },
    setup(){
      // 获取store和router
      const store = useStore();
      const router = useRouter();

      // 响应式数据
      const posts = ref([]);
      const loading = ref(true);
      const error = ref(false);
      const errorMessage = ref('');

      // 分页相关数据
      const currentPage = ref(1);
      const pageSize = ref(5);
      const totalItems = ref(0);
      const totalPages = ref(0);

      // 从store获取当前登录用户信息
      const user = reactive({
        username: store.state.user.username,
        id: store.state.user.id,
        followCount: 0,
        is_followed: false,
        photo: store.state.user.photo || '@/assets/mylogo.png'
      });

      // 监听 store 中的用户信息变化
      watch(
        () => store.state.user,
        (newUserState) => {
          // 当 store 中的用户信息变化时，更新组件中的用户信息
          user.username = newUserState.username;
          user.id = newUserState.id;
          user.photo = newUserState.photo || '@/assets/mylogo.png';

          // 如果用户ID变化且有效，重新加载帖子
          if (newUserState.id && newUserState.id !== '') {
            loadUserPosts();
          }
        },
        { deep: true }
      );

      // 计算属性：显示哪些页码按钮
      const displayedPages = computed(() => {
        const maxPagesToShow = 5;
        const pages = [];

        // 计算显示的页码范围
        let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1);

        // 调整起始页，确保显示足够的页码
        if (endPage - startPage + 1 < maxPagesToShow) {
          startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // 生成页码数组
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }

        return pages;
      });

      // 加载用户帖子列表数据
      const loadUserPosts = async () => {
        // 检查用户ID是否可用
        if (!user.id) {
          console.log('用户ID不可用，等待用户信息加载...');
          error.value = true;
          errorMessage.value = '等待用户信息加载...';
          return;
        }

        loading.value = true;
        error.value = false;

        try {
          console.log('开始加载用户帖子，用户ID:', user.id);

          // 调用API获取用户帖子列表，传入分页参数
          const response = await getUserPosts(
            {
              pageNum: currentPage.value,
              pageSize: pageSize.value
            },
            user.id
          );

          console.log('API返回的用户帖子数据:', response);

          if (response.error_msg === 'success') {
            // 更新帖子列表和分页信息
            posts.value = response.posts || [];
            console.log('当前页码:', currentPage.value, '用户帖子数据:', posts.value);
            totalItems.value = response.total || 0;
            totalPages.value = response.totalPages || 1;
            pageSize.value = response.pageSize || 10;
          } else {
            // 处理错误
            error.value = true;
            errorMessage.value = '获取用户帖子列表失败';
          }
        } catch (err) {
          console.error('加载用户帖子列表失败:', err);
          error.value = true;
          errorMessage.value = err.message || '加载用户帖子列表失败';
        } finally {
          loading.value = false;
        }
      };

      // 切换页码
      const changePage = (page) => {
        // 确保页码在有效范围内
        if (page < 1 || page > totalPages.value) return;

        // 更新当前页码并重新加载数据
        currentPage.value = page;
        loadUserPosts();

        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      // 跳转到帖子详情页
      const goToPostDetail = (postId) => {
        router.push(`/post/${postId}`);
      };

      // 格式化日期
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
      };

      // 获取内容预览
      const getContentPreview = (content) => {
        if (!content) return '无内容预览';
        // 移除Markdown标记，并截取前100个字符作为预览
        const plainText = content.replace(/[#*`[]()_>-]/g, '');
        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
      };

      // 关注用户
      const follow = ()=>{
        if(user.is_followed) return;
        user.is_followed = true;
        user.followCount++;
      }

      // 取消关注用户
      const unfollow = ()=>{
        if(!user.is_followed) return;
        user.is_followed = false;
        user.followCount--;
      }

      // 发布新帖子
      const post_a_post = ()=> {
        // 这里可以调用创建帖子的API
        // 成功后重新加载帖子列表
        loadUserPosts();
      }

      // 组件挂载时加载数据
      onMounted(() => {
        // 检查用户是否已登录
        if (store.state.user.is_login && store.state.user.id) {
          console.log('用户已登录，直接加载帖子');
          loadUserPosts();
        } else {
          // 如果用户未登录但有token，尝试获取用户信息
          const token = localStorage.getItem('jwt_token');
          if (token) {
            console.log('发现token，尝试获取用户信息');
            store.commit('updateToken', token);
            store.dispatch('getinfo', {
              success() {
                console.log('用户信息获取成功，加载帖子');
                // 用户信息获取成功后，通过watch会自动触发loadUserPosts
              },
              error() {
                console.error('获取用户信息失败');
                error.value = true;
                errorMessage.value = '获取用户信息失败，请重新登录';
              }
            });
          } else {
            console.log('未发现token，显示需要登录的提示');
            error.value = true;
            errorMessage.value = '请先登录后查看笔记';
          }
        }
      });

      return {
        // 数据
        user,
        posts,
        loading,
        error,
        errorMessage,
        currentPage,
        totalPages,
        displayedPages,

        // 方法
        follow,
        unfollow,
        post_a_post,
        loadUserPosts,
        changePage,
        goToPostDetail,
        formatDate,
        getContentPreview
      };
    }

  }
  </script>

  <style scoped>

  .container{
    margin-top: 20px;
  }
  </style>
