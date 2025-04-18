<template>
  <Content>
    <div class="container">
      <h1 class="my-4">你的笔记展示！</h1>
      
      <!-- 测试按钮 -->
      <div class="mb-4">
        <button class="btn btn-primary me-2" @click="loadMarkdownContent">从后端加载Markdown内容</button>
        <button class="btn btn-secondary" @click="resetContent">重置内容</button>
      </div>
      
      <!-- MarkShow 组件 -->
      <div class="row">
        <div class="col-12">
          <MarkShow 
            :content="markdownContent" 
            :title="title"
            :createdAt="createdTime"
            :category="category"
            :categoryName="categoryName"
            :showTitle="true"
            :showTime="true"
            :showCategory="true"
          />
        </div>
      </div>
    </div>
  </Content>
</template>

<script>
import { ref } from 'vue';
import Content from '@/components/ContentBase';
import MarkShow from '@/components/MarkShow.vue';
import { getPostList } from '@/api/post';

export default {
  name: 'TestMarkShow',
  components: {
    Content,
    MarkShow
  },
  setup() {
    // 响应式数据
    const markdownContent = ref('### 欢迎使用 MarkShow 组件\n这是初始内容，点击上方按钮从后端加载内容。');
    const title = ref('MarkShow 测试');
    const createdTime = ref(new Date().toLocaleString());
    const category = ref('1');
    const categoryName = ref('提问');
    const loading = ref(false);

    // 从后端加载Markdown内容
    const loadMarkdownContent = async () => {
      loading.value = true;
      
      try {
        // 调用API获取帖子列表
        const response = await getPostList();
        
        if (response && response.data && response.data.posts && response.data.posts.length > 0) {
          // 使用第一篇帖子的内容
          const post = response.data.posts[0];
          markdownContent.value = post.content || '获取的内容为空';
          title.value = post.title || '从后端获取的文档';
          createdTime.value = new Date(post.createdAt || Date.now()).toLocaleString();
          
          // 设置分类信息
          if (post.postCategoryId>0) {
            category.value = post.postCategoryId;
            // 这里可以根据分类ID获取分类名称，或者直接使用后端返回的分类名称
            // 如果后端返回了分类名称，可以直接使用
            categoryName.value = post.postCategoryName || '提问';
          }
        } else {
          // 如果没有获取到帖子，使用默认内容
          markdownContent.value = `# 从后端获取的Markdown内容

## 这是一个二级标题

这是一段普通文本，包含**粗体**和*斜体*。

### 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, MarkShow!");
}
\`\`\`

### 列表示例

- 项目1
- 项目2
- 项目3

### 表格示例

| 姓名 | 年龄 | 职业 |
| ---- | ---- | ---- |
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |

> 这是一段引用文本

![测试](http://stmchilxr.hd-bkt.clouddn.com/photo/1742993697925_8dabbcee-52c3-48e7-b123-8a4e63fb4759)`;
          title.value = '从后端获取的文档';
          createdTime.value = new Date().toLocaleString();
        }
      } catch (error) {
        console.error('加载Markdown内容失败:', error);
        // 发生错误时显示错误信息
        markdownContent.value = '### 加载内容失败\n请检查网络连接或稍后再试。';
      } finally {
        loading.value = false;
      }
    };

    // 重置内容
    const resetContent = () => {
      markdownContent.value = '### 欢迎使用 MarkShow 组件\n这是初始内容，点击上方按钮从后端加载内容。';
      title.value = 'MarkShow 测试';
      createdTime.value = new Date().toLocaleString();
      category.value = '1';
      categoryName.value = '提问';
    };

    // 返回需要在模板中使用的数据和方法
    return {
      markdownContent,
      title,
      createdTime,
      category,
      categoryName,
      loading,
      loadMarkdownContent,
      resetContent
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}
</style>