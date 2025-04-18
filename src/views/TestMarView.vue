<template>
    <Content>
    <!-- <div>
      <h1>发布新帖子</h1>
      <mavon-editor  >tt</mavon-editor>
      <button>提交帖子</button>
    </div> -->

    <div class="card">
        <div class="card-body">
            <h1>分享你的知识吧</h1>
            {{ test_data }}
            <br>
            <mavon-editor fontSize="20px" toolbarsBackground="pink" v-model="handbook"> </mavon-editor>
        </div>
    </div>
    <div>
        <h1>图片出来啊</h1>
        <img src="http://images-zq7.test.upcdn.net/mylogo.png" alt="logo">
        <img src="http://stmchilxr.hd-bkt.clouddn.com/photo/1742993697925_8dabbcee-52c3-48e7-b123-8a4e63fb4759" alt="七牛">
    </div>
    <br>
    <div class="card">
        <div class="card-body">
            <br>
            <h2>帖子展示</h2>
            <mavon-editor
              toolbarsBackground="pink"
              previewBackground="lightblue"
              :toolbarsFlag="false" 
              :subfield="false"
              defaultOpen="preview"
              :toolbars="markdownOption" 
              :ishljs="true"
              :transition="true"
              class="show"
              :xssOptions="xssOptions"
              v-model="handbook"/>

              
        </div>
    </div>

    </Content>
    
</template>
  
<script >
import Content from '@/components/ContentBase';
// toolbars: {
//     bold: true, // 粗体
//     italic: true, // 斜体
//     header: true, // 标题
//     underline: true, // 下划线
//     strikethrough: true, // 中划线
//     mark: true, // 标记
//     superscript: true, // 上角标
//     subscript: true, // 下角标
//     quote: true, // 引用
//     ol: true, // 有序列表
//     ul: true, // 无序列表
//     link: true, // 链接
//     imagelink: true, // 图片链接
//     code: true, // code
//     table: true, // 表格
//     fullscreen: true, // 全屏编辑
//     readmodel: true, // 沉浸式阅读
//     htmlcode: true, // 展示html源码
//     help: true, // 帮助
//     /* 1.3.5 */
//     undo: true, // 上一步
//     redo: true, // 下一步
//     trash: true, // 清空
//     save: true, // 保存（触发events中的save事件）
//     /* 1.4.2 */
//     navigation: true, // 导航目录
//     /* 2.1.8 */
//     alignleft: true, // 左对齐
//     aligncenter: true, // 居中
//     alignright: true, // 右对齐
//     /* 2.2.1 */
//     subfield: true, // 单双栏模式
//     preview: true, // 预览
// }
import $ from 'jquery'
import { ref } from 'vue';
export default {
    
    name:'TestMarView',
    components:{
        Content,
    },
    setup(){
        let test_data = ref('');
        $.ajax({
            url:"http://localhost:3000/test/cors",
            type: 'get',
            success: function(resp){
                console.log(resp);
                test_data.value = resp;
            }
        });
        return {
            test_data
        }
    },
    data() {
    return{
         handbook: "#### 欢迎使用markdown编译器",
         markdownOption: {
            readmodel: true, 
         },
         xssOptions:{
                whiteList: {
                    span: ['style']
                }
            }
    }
  }

}
</script>

<style scoped>
.show {
  font-size: 30px; /* 可根据需求调整文字大小 */
}
img{
    border-radius: 50%;
    width: 300px;
    height: 300px;
  }
</style>