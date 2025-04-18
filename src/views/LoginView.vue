<template>
  <Content>
    <div class="login-container">
      <div class="card login-card">
        <div class="card-body">
          <h2 class="text-center mb-4">欢迎登录</h2>
          <!-- prevent 是阻止掉默认的行为 -->
          <form @submit.prevent="login">    
            <div class="mb-3">
              <label for="username" class="form-label">用户名/邮箱</label>
              <input 
                type="text" 
                class="form-control" 
                id="username" 
                v-model="loginForm.username" 
                placeholder="请输入用户名或邮箱"
                :class="{'is-invalid': errors.username}"
                
              >
              <div class="invalid-feedback" v-if="errors.username">
                {{ errors.username }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">密码</label>
              <div class="input-group">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="password" 
                  v-model="loginForm.password" 
                  placeholder="请输入密码"
                  :class="{'is-invalid': errors.password}"
                  
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="togglePassword"
                >
                  <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
              
            </div>
            
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="rememberMe" v-model="loginForm.rememberMe">
              <label class="form-check-label" for="rememberMe">记住我</label>
            </div>
            
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </form>
          
          <div class="text-center mt-3">
            <p>还没有账号？ <router-link :to="{name: 'rigister'}">立即注册</router-link></p>
          </div>
          <div v-if="errors.message_error" class="alert alert-danger mt-3" role="alert">
            {{ errors.message_error }}
          </div>
          <hr>
        </div>
      </div>  
    </div>
  </Content>
</template>

<script>
// @ is an alias to /src
import Content from '@/components/ContentBase';
import {ref} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';

export default {
  name: "LoginView",
  components: {
    Content,
  },
  setup(){
    // const jwt_token = localStorage.getItem("jwt_token");
    const store = useStore();
    const router = useRouter();
    let err_msg = ref('none ');

    // if(jwt_token){
    //   store.commit("updateToken",jwt_token);
    //   store.dispatch("getinfo",{
    //     success(){
    //       router.push({name: "home"});
    //     },
    //     error(){

    //     }
    //   })
    // }

    const loginForm = ref({
      username: '',
      password: '',
      rememberMe: false
    });
    
    const errors = ref({
      username: '',
      password: '',
      message_error: '',
    });
    
    const isLoading = ref(false);
    const showPassword = ref(false);
    
    const validateForm = () => {
      let isValid = true;
      errors.value = {
        username: '',
        password: '',
        message_error:''
      };
      
      if (!loginForm.value.username) {
        errors.value.username = '请输入用户名或邮箱';
        isValid = false;
      }
      
      if (!loginForm.value.password) {
        errors.value.password = '请输入密码';
        isValid = false;
      }
   
      
      return isValid;
    };
    
    const login = () => {
      if (!validateForm()) return;
      
      isLoading.value = true;
      store.dispatch("login", {
        username: loginForm.value.username,
        password: loginForm.value.password,
        success(resp) {
          if (resp.error_msg === "success") {
            console.log("登录成功！");
            store.dispatch("getinfo",{
              success(){
                router.push({name:'home'});
                console.log(store.state.user)
              }
            })
            
          }
        },
        error(resp) { 
           errors.value.message_error = resp.error_msg;
        }
      }).finally(() => {
        isLoading.value = false;
      });
    };
    
    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };
    
    return {
      loginForm,
      errors,
      isLoading,
      showPassword,
      login,
      togglePassword,
      err_msg
    }
  },
  
  
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  background: linear-gradient(135deg, #6a9eda 0%, #9b7ade 100%);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 2rem;
}

.btn-primary {
  background-color: #6a9eda;
  border-color: #6a9eda;
  transition: all 0.3s ease;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #5a8ec4;
  border-color: #3aa876;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
  