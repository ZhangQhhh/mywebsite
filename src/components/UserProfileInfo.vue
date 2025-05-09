<template>
<div class="profile-card">
    <div class="card-body">
        <div class="profile-content">
            <div class="avatar-section">
                <div class="avatar-wrapper">
                    <img :src="user.photo || require('@/assets/mylogo.png')" class="avatar-img" alt="头像">
                </div>
            </div>
            <div class="info-section">
                <div class="username">{{ user.username }}</div>
                <div class="user-id">
                    <i class="bi bi-person-badge"></i>
                    用户ID: {{ user.id }}
                </div>
                <div class="fans">
                    <i class="bi bi-people"></i>
                    粉丝: {{ user.followCount }}
                </div>
                <!-- <button v-on:click="follow" type="button" v-if="!user.is_followed" class="btn btn-follow">关注</button>
                <button v-on:click="unfollow" type="button" v-if="user.is_followed" class="btn btn-unfollow">取消关注</button> -->
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
.profile-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-body {
    padding: 2rem;
}

.profile-content {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.avatar-section {
    flex: 0 0 auto;
}

.avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 4px solid white;
    transition: all 0.3s ease;
}

.avatar-wrapper:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}

.info-section {
    flex: 1;
}

.username {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    letter-spacing: 0.5px;
}

.user-id, .fans {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
}

.user-id i, .fans i {
    color: #6366f1;
    font-size: 1.1rem;
}

.btn-follow, .btn-unfollow {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    margin-top: 1rem;
}

.btn-follow:hover, .btn-unfollow:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.btn-unfollow {
    background: #e5e7eb;
    color: #4b5563;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .card-body {
        padding: 1.5rem;
    }
    
    .profile-content {
        gap: 1.5rem;
    }
    
    .avatar-wrapper {
        width: 100px;
        height: 100px;
    }
    
    .username {
        font-size: 1.3rem;
    }
}

@media (max-width: 480px) {
    .card-body {
        padding: 1.25rem;
    }
    
    .profile-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .avatar-wrapper {
        width: 90px;
        height: 90px;
        margin: 0 auto;
    }
    
    .user-id, .fans {
        justify-content: center;
    }
    
    .btn-follow, .btn-unfollow {
        width: 100%;
    }
}
</style>