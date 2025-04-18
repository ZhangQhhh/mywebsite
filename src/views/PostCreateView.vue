<template>
    <Content>
    <div class="card">
        <div class="card-body">
            <h1>发布新帖子</h1>
            <div class="mb-3">
                <label for="titleInput" class="form-label">标题</label>
                <input type="text" class="form-control" id="titleInput" v-model="title" placeholder="请输入帖子标题">
            </div>
            <div class="mb-3">
                <label for="categorySelect" class="form-label">分类</label>
                <select class="form-select" id="categorySelect" v-model="category">
                    <option value="" disabled>请选择分类</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.categoryId">{{ cat.categoryName}}</option>
                </select>
            </div>
            <mavon-editor 
                fontSize="18px" 
                toolbarsBackground="lightblue"
                v-model="content"
                @save="savePost"
                @imgAdd="handleImgAdd"
                :toolbars="markdownOption"
                :ishljs="true"
                :transition="true"
                :xssOptions="xssOptions"
                :scrollStyle="true"
                placeholder="开始编写你的帖子内容..."> 
            </mavon-editor>
            <div class="mt-3 d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="previewPost">预览</button>
                <button class="btn btn-primary" @click="savePost">发布帖子</button>
            </div>
        </div>
    </div>
    <br>
     <div class="card" v-if="showPreview">
        <div class="card-body">
            <h2>预览</h2>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>{{ title || '无标题' }}</h3>
                <div>
                    <span class="badge bg-primary me-2">{{ getCategoryName(category) }}</span>
                    <span class="text-muted">{{ currentTime }}</span>
                </div>
            </div>
            <mavon-editor
              previewBackground="#f8f9fa"
              :toolbarsFlag="false" 
              :subfield="false"
              defaultOpen="preview"
              :toolbars="previewOption" 
              :ishljs="true"
              :transition="true"
              :xssOptions="xssOptions"
              class="preview-editor"
              v-model="content"/>
        </div>
    </div> 
    </Content>
</template>
  
<script>
import Content from '@/components/ContentBase';
import 'mavon-editor/dist/css/index.css';
import { getCategories, createPost,uploadImage} from '@/api/post';
import { ref, computed, onMounted, reactive, getCurrentInstance } from 'vue';

export default {
    name: 'PostCreateView',
    components: {
        Content,
    },
    setup() {
        // 响应式数据
        const title = ref('');
        const content = ref('#### 开始编写你的帖子内容');
        const category = ref('');
        const showPreview = ref(false);
        const categories = ref([]);
        
        // 获取应用实例，用于访问全局属性
        const { proxy } = getCurrentInstance();
        

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


        // Markdown编辑器配置
        const markdownOption = reactive({
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
        });
        
        const previewOption = reactive({
            readmodel: true,
            navigation: true,
        });
        
        // 计算属性
        const currentTime = computed(() => {
            const now = new Date();
            return now.toLocaleString();
        });
        
        // 方法
        const previewPost = () => {
            if (!title.value.trim()) {
                proxy.$message.warning('请输入帖子标题');
                return;
            }
            if (!category.value) {
                proxy.$message.warning('请选择帖子分类');
                return;
            }
            showPreview.value = true;
        };
        
        const savePost = () => {
            if (!title.value.trim()) {
                proxy.$message.warning('请输入帖子标题');
                return;
            }
            if (!category.value) {
                proxy.$message.warning('请选择帖子分类');
                return;
            }
            
            // 创建帖子对象
            const post = {
                title: title.value,
                content: content.value,
                category: category.value,
                createdAt: new Date().toISOString()
            };
            console.log("我的乖乖-----"+post.createdAt)
            // 调用API发布帖子
            createPost(post)
                .then(response => {
                    console.log('发布帖子成功:', response);
                    // 显示成功消息
                    proxy.$message.success('帖子发布成功！');
                    // 重置表单
                    resetForm();
                    // 可以选择跳转到帖子列表或帖子详情页
                    // this.$router.push('/posts');
                })
                .catch(error => {
                    console.error('发布帖子失败:', error);
                    proxy.$message.error(`发布失败: ${error.message || '未知错误'}`);
                });
        };
        
        const resetForm = () => {
            title.value = '';
            content.value = '#### 开始编写你的帖子内容';
            category.value = '';
            showPreview.value = false;
        };
        
        const getCategoryName = (categoryValue) => {
            const category = categories.value.find(cat => cat.id === categoryValue);
            return category ? category.name : '未分类';
        };
        
        const fetchCategories = () => {
            getCategories()
                .then(response => {
                    categories.value = response.postCategories;
                    console.log('获取到的分类数据:', categories.value);
                    console.log('获取到的分类id是: ', categories.value.categoryId);
                })
                .catch(error => {
                    console.error('获取分类数据失败:', error);
                });
        };
        
       

        const handleImgAdd = (pos, file) => {
            // 显示上传中的提示
            console.log('正在上传图片:', file.name);
            console.log('pos = '+pos);
            
            // 调用上传图片API
            uploadImage(file)
                .then(response => {
                    console.log('resp:'+response);
                    console.log('====');
                    let url = response;
                    // 确保URL格式正确（添加协议前缀如果缺少）
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'http://' + url;
                    }
                    
                    // 将返回的url替换到文本原位置
                    let oStr = `(${pos})`;
                    let nStr = `(${url})`;
                    let index = content.value.indexOf(oStr)
                    let str = content.value.replace(oStr, '')
                    let insertStr = (soure, start, newStr) => {
                            return soure.slice(0, start) + newStr + soure.slice(start)
                        }
                         // 使用 insertStr 函数更新 content 的值
                    content.value = insertStr(str, index, nStr);
                    
                })
                .catch(error => {
                    console.error('图片上传失败:', error);
                    proxy.$message.error('图片上传失败，请重试');
                });
        };
        
        // 生命周期钩子 - 组件创建时获取分类数据
        onMounted(() => {
            fetchCategories();
        });
    
        // 返回模板中需要使用的响应式数据和方法
        return {
            title,
            content,
            category,
            showPreview,
            categories,
            markdownOption,
            previewOption,
            currentTime,
            xssOptions,
            previewPost,
            savePost,
            getCategoryName,
            handleImgAdd
        };
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