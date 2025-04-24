<template>
  <Content>
    <div class="login-container">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="card login-card">
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-circle">
              <i class="bi bi-person-circle"></i>
            </div>
          </div>
          <h2 class="text-center mb-0">欢迎回来</h2>
          <p class="text-center text-muted mt-2">请登录您的账户</p>
        </div>
        <div class="card-body">
          <!-- prevent 是阻止掉默认的行为 -->
          <form @submit.prevent="login">    
            <div class="form-group mb-4">
              <label for="username" class="form-label">
                <i class="bi bi-person-fill me-2"></i>用户名/邮箱
              </label>
              <div class="input-group input-group-with-focus">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="bi bi-person"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0" 
                  id="username" 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名或邮箱"
                  :class="{'is-invalid': errors.username}"
                >
                <div class="invalid-feedback" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label for="password" class="form-label">
                <i class="bi bi-key-fill me-2"></i>密码
              </label>
              <div class="input-group input-group-with-focus">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="bi bi-lock"></i>
                </span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control border-start-0 border-end-0" 
                  id="password" 
                  v-model="loginForm.password" 
                  placeholder="请输入密码"
                  :class="{'is-invalid': errors.password}"
                >
                <button 
                  class="btn btn-outline-secondary border-start-0 bg-transparent"
                  type="button" 
                  @click="togglePassword"
                >
                  <i class="bi" :class="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </button>
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-between mb-4">
              <div class="form-check custom-checkbox">
                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="loginForm.rememberMe">
                <label class="form-check-label" for="rememberMe">
                  <span class="checkbox-text">记住我</span>
                </label>
              </div>
              <div>
                <a href="#" class="text-decoration-none forgot-link">
                  <i class="bi bi-question-circle-fill me-1"></i>忘记密码?
                </a>
              </div>
            </div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg login-btn" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span class="btn-text">{{ isLoading ? '登录中...' : '登录' }}</span>
                <i class="bi bi-arrow-right-circle-fill ms-2"></i>
              </button>
            </div>
          </form>
          
          <div class="divider">
            <span>或者（暂不可用，敬请期待....）</span>
          </div>
          
          <div class="social-login">
            <button class="social-btn wechat">
              <i class="bi bi-chat-fill"></i>
            </button>
            <button class="social-btn qq">
              <i class="bi bi-chat-dots-fill"></i>
            </button>
            <button class="social-btn weibo">
              <i class="bi bi-globe2"></i>
            </button>
          </div>
          
          <div class="text-center mt-4">
            <p class="mb-0">还没有账号? <router-link :to="{name: 'rigister'}" class="register-link">立即注册 <i class="bi bi-arrow-right"></i></router-link></p>
          </div>
          
          <div v-if="errors.message_error" class="alert alert-danger mt-4 animated-alert" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errors.message_error }}
          </div>
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

    const store = useStore();
    const router = useRouter();
    let err_msg = ref('none ');

 

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
            store.dispatch("getinfo",{
              success(){
                router.push({name:'home'});
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
@keyframes floating {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  background: linear-gradient(135deg, #6a9eda 0%, #9b7ade 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.shape-1 {
  width: 120px;
  height: 120px;
  background: linear-gradient(to right, #ff6b6b, #ffa3a3);
  top: 10%;
  left: 15%;
  animation: floating 8s ease-in-out infinite;
}

.shape-2 {
  width: 80px;
  height: 80px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  top: 60%;
  left: 20%;
  animation: floating 9s ease-in-out infinite 1s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(to right, #43e97b, #38f9d7);
  top: 20%;
  right: 15%;
  animation: floating 10s ease-in-out infinite 2s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: linear-gradient(to right, #fa709a, #fee140);
  bottom: 15%;
  right: 20%;
  animation: floating 7s ease-in-out infinite 1.5s;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 1;
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.card-header {
  background: transparent;
  border-bottom: none;
  padding: 2rem 2rem 0;
  position: relative;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a9eda 0%, #9b7ade 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(106, 158, 218, 0.4);
  animation: pulse 3s infinite;
}

.logo-circle i {
  font-size: 40px;
  color: white;
}

.card-header h2 {
  font-weight: 700;
  color: #333;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 1.5rem 2rem 2rem;
}

.form-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.input-group-with-focus {
  transition: all 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
}

.input-group-with-focus:focus-within {
  box-shadow: 0 0 0 3px rgba(106, 158, 218, 0.15);
  transform: translateY(-2px);
}

.form-control, .input-group-text, .btn-outline-secondary {
  border-color: #e0e0e0;
  height: 50px;
}

.form-control {
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.form-control:focus {
  box-shadow: none;
  border-color: #6a9eda;
}

.input-group-text {
  color: #6a9eda;
  font-size: 1.2rem;
}

.custom-checkbox .form-check-input {
  width: 20px;
  height: 20px;
  margin-top: 0;
  border: 2px solid #6a9eda;
  cursor: pointer;
}

.custom-checkbox .form-check-input:checked {
  background-color: #6a9eda;
  border-color: #6a9eda;
}

.custom-checkbox .form-check-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-text {
  margin-left: 0.5rem;
  font-weight: 500;
}

.login-btn {
  background: linear-gradient(45deg, #6a9eda, #9b7ade);
  border: none;
  transition: all 0.4s ease;
  height: 55px;
  font-weight: 600;
  letter-spacing: 0.8px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9b7ade, #6a9eda);
  transition: all 0.4s ease;
  z-index: -1;
}

.login-btn:hover:before {
  left: 0;
}

.login-btn:hover {
  box-shadow: 0 8px 20px rgba(106, 158, 218, 0.4);
  transform: translateY(-3px);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(106, 158, 218, 0.2);
}

.login-btn:disabled {
  background: #a0a0a0;
  transform: none;
  box-shadow: none;
}

.login-btn .btn-text {
  position: relative;
  z-index: 2;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #888;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  margin: 0 10px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 1.5rem;
}

.social-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.wechat {
  background: #07C160;
}

.qq {
  background: #12B7F5;
}

.weibo {
  background: #E6162D;
}

a {
  color: #6a9eda;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  color: #5a8ec4;
}

.register-link {
  color: #9b7ade;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.register-link i {
  opacity: 0;
  margin-left: 2px;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #8a6ad0;
}

.register-link:hover i {
  opacity: 1;
  transform: translateX(3px);
}

.forgot-link {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
}

.forgot-link i {
  transition: all 0.3s ease;
}

.forgot-link:hover i {
  transform: rotate(15deg);
}

.alert-danger {
  background-color: rgba(255, 205, 205, 0.6);
  border-color: rgba(250, 160, 160, 0.5);
  color: #d9534f;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(217, 83, 79, 0.1);
}

.animated-alert {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
  