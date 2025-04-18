<template>
<div class="card edit-field">
    <div class="card-body">
        <label for="edit-post">分享生活</label>
        <br>
        <textarea v-model="content" class="form-control" placeholder="讲两句吧~" id="edit-post" style="height: 100px"></textarea>
        <button v-on:click="post_a_post" type="button" class="btn btn-info btn-sm">发帖</button>
        <!-- <div>{{ content }}</div> -->
    </div>
</div>
</template>

<script>
 import {ref}  from 'vue'
    export default{
        name:"UserProfileWrite",
        setup(props,context){
            let content = ref('');  // 修改ref要用.value来做
            let post_a_post = () =>{
                if(content.value.trim()!== ''){  // trim去除字符串尾部的空格
                    context.emit('post_a_post',content.value);
                    content.value = ' ';
                }
                
            }
            return {
                content,
                post_a_post
            }
        }
    }
</script>

<style scoped>
.edit-field{
    margin-top: 20px;
}
button{
    margin-top: 10px;
}
</style>