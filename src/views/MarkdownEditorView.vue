<template>
    <Content>
    <div class="card">
        <div class="card-body">
            <h1>Markdown编辑器</h1>
            <div class="mb-3">
                <label for="titleInput" class="form-label">标题</label>
                <input type="text" class="form-control" id="titleInput" v-model="title" placeholder="请输入文章标题">
            </div>
            <mavon-editor 
                fontSize="18px" 
                toolbarsBackground="#f8f9fa" 
                v-model="content"
                @save="saveContent"
                :toolbars="markdownOption"
                :ishljs="true"
                :transition="true"
                placeholder="开始编写你的文章..."> 
            </mavon-editor>
            <div class="mt-3 d-flex justify-content-end">
                <button class="btn btn-primary" @click="saveContent">保存文章</button>
            </div>
        </div>
    </div>
    <br>
     <div class="card" v-if="showPreview">
        <div class="card-body">
            <h2>预览</h2>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>{{ title || '无标题' }}</h3>
                <span class="text-muted">{{ currentTime }}</span>
            </div>
            <mavon-editor
              previewBackground="#f8f9fa"
              :toolbarsFlag="false" 
              :subfield="false"
              defaultOpen="preview"
              :toolbars="previewOption" 
              :ishljs="true"
              :transition="true"
              class="preview-editor"
              v-model="content"/>
        </div>
    </div> 
    </Content>
</template>
  
<script>
import Content from '@/components/ContentBase';
import 'mavon-editor/dist/css/index.css';
import { ref, getCurrentInstance } from 'vue';

export default {
    name: 'MarkdownEditorView',
    components: {
        Content,
    },
    setup() {
        const title = ref('');
        const content = ref('#### 开始编写你的Markdown文章');
        
        // 获取应用实例，用于访问全局属性
        const { proxy } = getCurrentInstance();
        
        return {
            title,
            content,
            proxy
        };
    },
    data() {
        return {
            showPreview: false,
            savedContent: [],
            markdownOption: {
                bold: true,         // 粗体
                italic: true,       // 斜体
                header: true,       // 标题
                underline: true,    // 下划线
                strikethrough: true, // 中划线
                mark: true,         // 标记
                superscript: true,  // 上角标
                subscript: true,    // 下角标
                quote: true,        // 引用
                ol: true,           // 有序列表
                ul: true,           // 无序列表
                link: true,         // 链接
                imagelink: true,    // 图片链接
                code: true,         // 代码
                table: true,        // 表格
                fullscreen: true,   // 全屏编辑
                readmodel: true,    // 沉浸式阅读
                htmlcode: true,     // 展示html源码
                help: true,         // 帮助
                undo: true,         // 上一步
                redo: true,         // 下一步
                trash: true,        // 清空
                save: true,         // 保存
                navigation: true,   // 导航目录
                alignleft: true,    // 左对齐
                aligncenter: true,  // 居中
                alignright: true,   // 右对齐
                subfield: true,     // 单双栏模式
                preview: true,      // 预览
            },
            previewOption: {
                readmodel: true,
                navigation: true,
            },
        }
    },
    computed: {
        currentTime() {
            const now = new Date();
            return now.toLocaleString();
        }
    },
    methods: {
        saveContent() {
            if (!this.title.trim()) {
                this.proxy.$message.warning('请输入文章标题');
                return;
            }
            
            // 保存文章内容
            const article = {
                id: Date.now(),
                title: this.title,
                content: this.content,
                createdAt: new Date().toLocaleString()
            };
            
            // =================== API调用区域 ===================
            // TODO: 在此处添加API调用代码
            // 示例API调用代码:
            /*
            // 使用axios发送POST请求到后端API
            this.$axios.post('/api/articles', article)
                .then(response => {
                    console.log('API响应:', response.data);
                    // 保存成功后的处理
                    this.showPreview = true;
                    alert('文章保存成功！');
                })
                .catch(error => {
                    console.error('保存文章失败:', error);
                    this.proxy.$message.error('保存失败，请稍后重试');
                });
            */
            // =================== API调用区域结束 ===================
            
            // 临时保存到本地数组（可在API实现后移除）
            this.savedContent.push(article);
            
            // 显示预览
            this.showPreview = true;
            this.proxy.$message.success('文章保存成功！');
        }
        }
    }

</script>

<style scoped>
.preview-editor {
  font-size: 16px;
}

.mavon-editor {
  min-height: 400px;
}
</style>