<template>
<div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-4">
                <img :src="user.photo || require('@/assets/mylogo.png')" class="img-fluid" alt="头像">
            </div>
            <div class="col-8">
                <div class="username">{{ user.username }}</div>
                <div class="user-id">用户ID: {{ user.id }}</div>
                <div class="fans">粉丝: {{ user.followCount }}</div>
                <button v-on:click="follow" type="button" v-if="!user.is_followed" class="btn btn-secondary btn-sm">关注</button>
                <button v-on:click="unfollow" type="button" v-if="user.is_followed" class="btn btn-secondary btn-sm">取消关注</button>
            </div>
        </div>
    </div>
</div>

</template>

<script>
export default{
    name:'UserProfileInfo',
    props:{ // 从父组件接受过来的参数都在这里,通过v-bind 穿过来的
        user:{
            type: Object,
            required: true,
        },
    },
    setup(props,context){
        const follow = () => {
            context.emit('follow');
        }
        const unfollow = () =>{
            context.emit('unfollow');
        }
        return {
            follow,
            unfollow
        }
    }
}
</script>

<style scoped>
img{
    border-radius: 50%;
}
.username{
    font-weight: bold;
}
.fans{
    font-size: 12px;
    color:gray;
}
button{
    padding: 2px 4px;
    font-size: 12px;
}

</style>