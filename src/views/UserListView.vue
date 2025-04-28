<template>
    <Content>
      <div class="container">
       <!-- 帖子列表组件 -->
        <UserProfilePosts 
          :posts="posts" 
          :loading="loading" 
          :error="error" 
          :errorMessage="errorMessage" 
          :currentPage="currentPage" 
          :totalPages="totalPages" 
          :displayedPages="displayedPages" 
          @change-page="changePage"
        /> 
      </div>
         
    </Content>
  </template>
  
  <script>
  // v-bind 的简写的冒号
  // @ is an alias to /src
  import Content from '@/components/ContentBase';
  import UserProfilePosts from '@/components/UserProfilePosts';
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getPostList } from '@/api/post';

  export default {
    name: "UserListView",
    components: {
      Content,
      UserProfilePosts,
    },
    setup() {
      // 路由
      const router = useRouter();
      
      // 用户信息数据
      const user = ref({
        id: 1,
        username: '示例用户',
        photo: '',
        followCount: 0,
        is_followed: false
      });
      
      // 响应式数据
      const posts = ref([]);
      const loading = ref(true);
      const error = ref(false);
      const errorMessage = ref('');
      
      // 分页相关数据
      const currentPage = ref(1);
      const pageSize = ref(10);
      const totalItems = ref(0);
      const totalPages = ref(0);
      
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
      
      // 加载帖子列表数据
      const loadPosts = async () => {
        loading.value = true;
        error.value = false;
        
        try {
          // 调用API获取帖子列表，传入分页参数
          const response = await getPostList({
            pageNum: currentPage.value,  // 修改参数名称为pageNum，与后端API期望的参数名一致
            pageSize: pageSize.value
          });
          

          
          if (response.error_msg === 'success') {
            // 更新帖子列表和分页信息
            posts.value = response.posts || [];
            totalItems.value = response.total || 0;
            totalPages.value = response.totalPages || 1;
            pageSize.value = response.pageSize || 10;
          } else {
            // 处理错误
            error.value = true;
            errorMessage.value = '获取帖子列表失败';
          }
        } catch (err) {
          console.error('加载帖子列表失败:', err);
          error.value = true;
          errorMessage.value = err.message || '加载帖子列表失败';
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
        loadPosts();
        
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
           // 更全面的正则表达式，移除各种Markdown语法标记
           const plainText = content.replace(/[#*`[]()_>~!|{}=+-]/g, '')
                                    .replace(/\b(https?:\/\/[^\s]+)/g, '')
                                    .replace(/\n/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
      };
      
      // 关注用户
      const follow = () => {
        if(user.value.is_followed) return;
        user.value.is_followed = true;
        user.value.followCount++;
      };
      
      // 取消关注用户
      const unfollow = () => {
        if(!user.value.is_followed) return;
        user.value.is_followed = false;
        user.value.followCount--;
      };
      
      // 发布新帖子
      const post_a_post = () => {
        // 这里可以调用创建帖子的API
        // 成功后重新加载帖子列表
        loadPosts();
      };
      
      // 组件挂载时加载数据
      onMounted(() => {
        loadPosts();
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
        loadPosts,
        changePage,
        goToPostDetail,
        formatDate,
        getContentPreview,
        follow,
        unfollow,
        post_a_post
      };
    }
  }
  </script>

  
  <style scoped>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 15px;
  }
  
  .post-card {
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    border-left: 4px solid #007bff;
  }
  
  .post-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .post-content-preview {
    color: #6c757d;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .pagination .page-link {
    color: #007bff;
  }
  
  .pagination .page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
  }
  </style>
  