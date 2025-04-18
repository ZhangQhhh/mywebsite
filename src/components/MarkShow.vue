<template>
  <div class="mark-show-container">
    <div class="mark-show-card">
      <div v-if="showTitle" class="mark-show-header">
        <h3 class="mark-show-title">{{ title }}</h3>
        <div class="mark-show-meta">
          <span v-if="showCategory && category" class="mark-show-category badge bg-primary me-2">{{ categoryName }}</span>
          <span v-if="showTime" class="mark-show-time">{{ createdAt }}</span>
        </div>
      </div>
      <div class="mark-show-content">
        <mavon-editor
          v-model="localContent"
          :subfield="false"
          :defaultOpen="'preview'"
          :toolbarsFlag="false"
          :editable="false"
          :scrollStyle="true"
          :ishljs="true"
          :previewOption="previewOption"
          :xssOptions="xssOptions"
          :transition="true"
          :navigation="true" 
          class="preview-editor"/>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';

export default {
  name: 'MarkShow',
  props: {
    content: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    createdAt: {
      type: String,
      default: () => new Date().toLocaleString()
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    showTime: {
      type: Boolean,
      default: true
    },
    showCategory: {
      type: Boolean,
      default: true
    },
    category: {
      type: [String, Number],
      default: ''
    },
    categoryName: {
      type: String,
      default: ''
    },
    customPreviewOption: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // 响应式数据
    const localContent = ref(props.content || '');
    
    // 预览选项
    const previewOption = ref({
      readmodel: true,
      navigation: true,
      ...props.customPreviewOption
    });
    
    // XSS选项配置
    const xssOptions = ref({
      whiteList: {
        // 默认白名单中添加img标签及其常用属性
        img: ['src', 'alt', 'width', 'height', 'style', 'class', 'title', 'loading'],
        // 保留其他标签的默认配置
        span: ['style'],
        a: ['target', 'href', 'title', 'class', 'style'],
        abbr: ['title', 'class', 'style'],
        div: ['class', 'style'],
        p: ['class', 'style'],
        code: ['class', 'style'],
        pre: ['class', 'style'],
        table: ['width', 'border', 'align', 'valign', 'class', 'style'],
        th: ['width', 'rowspan', 'colspan', 'align', 'valign', 'class', 'style'],
        td: ['width', 'rowspan', 'colspan', 'align', 'valign', 'class', 'style']
      }
    });
    
    // 处理内容中的图片URL，确保它们有正确的协议前缀并修复嵌套图片语法
    const processImageUrls = () => {
      if (!localContent.value) return;
      
      let processedContent = localContent.value;
      
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
      
      // 预加载图片
      const preloadImages = () => {
        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = imgRegex.exec(processedContent)) !== null) {
          const [, , imageUrl] = match;
          if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;
          }
        }
      };
      
      // 执行图片预加载
      preloadImages();
      
      // 更新处理后的内容
      localContent.value = processedContent;
    };
    
    // 生命周期钩子 - 组件创建时
    onMounted(() => {
      // 初始化localContent
      localContent.value = props.content || '';
      
      // 处理内容中的图片URL
      processImageUrls();
    });
    
    // 监听props变化
    watch(() => props.content, (newVal) => {
      localContent.value = newVal;
      // 当内容变化时，处理图片URL
      processImageUrls();
    });
    
    watch(() => props.customPreviewOption, (newVal) => {
      previewOption.value = {
        readmodel: true,
        navigation: true,
        ...newVal
      };
    }, { deep: true });
    
    // 返回模板中需要的数据和方法
    return {
      localContent,
      previewOption,
      xssOptions,
      processImageUrls
    };
  }
}
</script>

<style scoped>
.mark-show-container {
  margin-bottom: 20px;
  border: 1px solid #ddd; /* 添加边框以便调试 */
  min-height: 300px;
}

.mark-show-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
  min-height: 200px; /* 确保有最小高度 */
}

.mark-show-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.mark-show-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.mark-show-meta {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.mark-show-category {
  font-size: 0.8rem;
}

.mark-show-time {
  font-size: 0.9rem;
  color: #999;
}

.mark-show-content {
  padding: 20px;
}

/* 自定义mavon-editor样式 */
.preview-editor {
  font-size: 16px;
  min-height: 200px;
  border: none !important;
}

/* 移除mavon-editor默认边框 */
.preview-editor .v-note-wrapper {
  border: none !important;
  min-height: 200px;
}
</style>