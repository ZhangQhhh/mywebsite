<template>
  <Content>
    <div class="container">
      <!-- 帖子内容展示区 -->
      <div class="row">
        <div class="col-12">
          <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2">正在加载帖子内容...</p>
          </div>
          
          <div v-else-if="error" class="alert alert-danger my-4" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ errorMessage }}</p>
            <hr>
            <p class="mb-0">请检查网络连接或稍后再试。</p>
          </div>
          
          <MarkShow 
            v-else
            :content="markdownContent" 
            :title="title"
            :createdAt="createdTime"
            :category="category"
            :categoryName="categoryName"
            :showTitle="true"
            :showTime="true"
            :showCategory="true"
          />

          <!-- 添加评论组件 -->
          <div class="mt-4">
            <CommentSection 
              :contentId="postId"
              :pageSize="10"
            />
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Content from '@/components/ContentBase.vue';
import MarkShow from '@/components/MarkShow.vue';
import CommentSection from '@/components/CommentSection.vue'; // 导入评论组件
import { getPostDetail, increasePostViews } from '@/api/post';

export default {
  name: 'PostView',
  components: {
    Content,
    MarkShow,
    CommentSection // 注册评论组件
  },
  setup() {
    // 响应式数据
    const markdownContent = ref('');
    const title = ref('');
    const createdTime = ref('');
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref('');
    const category = ref('1');
    const categoryName = ref('提问');
    
    // 获取路由参数
    const route = useRoute();
    const postId = route.params.id; // 获取帖子ID
    console.log('帖子ID:', postId);

    // 处理内容中的图片URL，确保它们有正确的协议前缀并修复嵌套图片语法
    const processImageUrls = (content) => {
      if (!content) return content;
      
      let processedContent = content;
      
      // 首先处理嵌套的图片语法问题 - 匹配形如 ![text![text](url)text] 的嵌套图片
      const nestedImgRegex = /!\[([^[]*?)!\[([^\]]*)\]\(([^)]+)\)([^\]]*)\]/g;
      processedContent = processedContent.replace(nestedImgRegex, (match, prefix, innerAlt, innerUrl) => {
        console.log('检测到嵌套图片语法，正在修复');
        // 提取内部图片的URL和文本，重新构建正确的Markdown图片语法
        return `![${innerAlt}](${innerUrl})`;
      });
      
      // 然后处理普通图片链接的协议前缀
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      let tempContent = processedContent;
      
      // 遍历所有图片链接
      while ((match = imgRegex.exec(tempContent)) !== null) {
        const [fullMatch, altText, imageUrl] = match;
        
        // 检查URL是否缺少协议前缀
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          // 添加http前缀
          const newImageUrl = 'http://' + imageUrl;
          // 替换原始链接
          const newImgMarkdown = `![${altText}](${newImageUrl})`;
          processedContent = processedContent.replace(fullMatch, newImgMarkdown);
        }
      }
      
      return processedContent;
    };

    // 从后端加载帖子内容
    const loadPostContent = async () => {
      loading.value = true;
      error.value = false;
      
      try {
        // 调用API获取帖子详情
        const response = await getPostDetail(postId);
        
        if (response.error_msg === 'success') {
          // 使用获取到的帖子内容
          const post = response.post;
          // postCategoryName
          // 处理帖子内容中的图片URL
          markdownContent.value = processImageUrls(post.postContent) || '获取的内容为空';
          title.value = post.postTitle || '帖子详情';
          createdTime.value = new Date(post.createTime || Date.now()).toLocaleString();

           // 设置分类信息
          if (post.postCategoryId) {
            category.value = post.postCategoryId;
            // 这里可以根据分类ID获取分类名称，或者直接使用后端返回的分类名称
            // 如果后端返回了分类名称，可以直接使用
            categoryName.value = post.postCategoryName || '未知';
          }

        } else {
          // 如果没有获取到帖子，显示错误
          error.value = true;
          errorMessage.value = '未找到该帖子或帖子内容为空';
          markdownContent.value = '';
        }
      } catch (err) {
        console.error('加载帖子内容失败:', err);
        // 发生错误时显示错误信息
        error.value = true;
        errorMessage.value = err.message || '加载帖子内容失败';
        markdownContent.value = '';
      } finally {
        loading.value = false;
      }
    };

    // 检查是否需要增加阅读量（防止重复计数）
    const shouldIncreaseViews = (postId) => {
      // 获取已访问帖子的记录
      const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '{}');
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24小时的毫秒数
      
      // 检查是否在24小时内访问过该帖子
      if (viewedPosts[postId] && (now - viewedPosts[postId]) < twentyFourHours) {
        console.log('该帖子在24小时内已被访问过，不增加阅读量');
        return false;
      }
      
      // 更新访问记录
      viewedPosts[postId] = now;
      localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
      return true;
    };
    
    // 增加帖子阅读量
    const increaseViews = async () => {
      try {
        // 检查是否需要增加阅读量
        if (shouldIncreaseViews(postId)) {
          // 调用API增加阅读量
          const resp = await increasePostViews(postId);
          if(resp.error_msg === 'success'){
            console.log('帖子阅读量已增加');
          }
          
        }
      } catch (err) {
        console.error('增加帖子阅读量失败:', err);
        // 这里不显示错误给用户，因为这不影响帖子内容的显示
      }
    };
    
    // 页面加载时自动获取帖子内容并增加阅读量
    onMounted(() => {
      loadPostContent();
      // 加载完成后增加阅读量
      increaseViews();
    });

    // 返回需要在模板中使用的数据和方法
    return {
      markdownContent,
      title,
      createdTime,
      loading,
      error,
      errorMessage,
      category,
      categoryName,
      postId // 添加 postId 到返回值中
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 15px;
}
</style>
