<template>
  <Content>
    <div class="register-container">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="card register-card">
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-circle">
              <i class="bi bi-person-plus-fill"></i>
            </div>
          </div>
          <h2 class="text-center mb-0">创建账号</h2>
          <p class="text-center text-muted mt-2">请填写下列信息完成注册</p>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleRegister">
            <div class="form-group mb-4">
              <label for="username" class="form-label">
                <i class="bi bi-person-badge-fill me-2"></i>用户名
              </label>
              <div class="input-group input-group-with-focus">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  id="username"
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  :class="{'is-invalid': errors.username}"
                  required
                >
                <div class="invalid-feedback" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>
            </div>

            <div class="form-group mb-4">
              <label for="email" class="form-label">
                <i class="bi bi-envelope-fill me-2"></i>邮箱
              </label>
              <div class="input-group input-group-with-focus">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control border-start-0"
                  id="email"
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  :class="{'is-invalid': errors.email}"
                  required
                >
                <div class="invalid-feedback" v-if="errors.email">
                  {{ errors.email }}
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
                  v-model="registerForm.password"
                  placeholder="请输入密码"
                  :class="{'is-invalid': errors.password}"
                  required
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
              <div class="form-text password-hint">
                <i class="bi bi-info-circle me-1"></i>密码长度至少6位，包含字母和数字
              </div>
            </div>

            <div class="form-group mb-4">
              <label for="confirmPassword" class="form-label">
                <i class="bi bi-shield-lock-fill me-2"></i>确认密码
              </label>
              <div class="input-group input-group-with-focus">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  class="form-control border-start-0"
                  id="confirmPassword"
                  v-model="registerForm.confirmedPassword"
                  placeholder="请再次输入密码"
                  :class="{'is-invalid': errors.confirmPassword}"
                  required
                >
                <div class="invalid-feedback" v-if="errors.confirmPassword">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>

            <div class="mb-4 custom-checkbox terms-check">
              <input type="checkbox" class="form-check-input" id="agreeTerms" v-model="registerForm.agreeTerms">
              <label class="form-check-label" for="agreeTerms">
                <span class="checkbox-text">我已阅读并同意<a href="#" class="terms-link">服务条款</a>和<a href="#" class="privacy-link">隐私政策</a></span>
              </label>
              <div class="invalid-feedback d-block" v-if="errors.agreeTerms">
                {{ errors.agreeTerms }}
              </div>
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg register-btn" :disabled="isLoading || !registerForm.agreeTerms">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span class="btn-text">{{ isLoading ? '注册中...' : '注册' }}</span>
                <i class="bi bi-arrow-right-circle-fill ms-2"></i>
              </button>
            </div>
          </form>

          <div class="text-center mt-4">
            <p class="mb-0">已有账号？ <router-link :to="{name: 'login'}" class="login-link">立即登录 <i class="bi bi-arrow-right"></i></router-link></p>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<script>
// @ is an alias to /src
import Content from '@/components/ContentBase';
import { ref, reactive, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import $ from 'jquery';
import { API_ENDPOINTS } from '@/config/api';

export default {
  name: "RigisterView",
  components: {
    Content,
  },
  setup() {
    const router = useRouter();

    // 获取应用实例，用于访问全局属性
    const { proxy } = getCurrentInstance();

    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      confirmedPassword: '',
      agreeTerms: false
    });

    const errors = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: ''
    });

    const isLoading = ref(false);
    const showPassword = ref(false);

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const validateForm = () => {
      let isValid = true;

      // 重置错误信息
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });

      // 验证用户名
      if (!registerForm.username.trim()) {
        errors.username = '请输入用户名';
        isValid = false;
      } else if (registerForm.username.length < 3) {
        errors.username = '用户名长度不能少于3位';
        isValid = false;
      }

      // 验证邮箱
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!registerForm.email.trim()) {
        errors.email = '请输入邮箱';
        isValid = false;
      } else if (!emailRegex.test(registerForm.email)) {
        errors.email = '请输入有效的邮箱地址';
        isValid = false;
      }

      // 验证密码
      if (!registerForm.password) {
        errors.password = '请输入密码';
        isValid = false;
      } else if (registerForm.password.length < 6) {
        errors.password = '密码长度不能少于6位';
        isValid = false;
      } else if (!/[A-Za-z]/.test(registerForm.password) || !/[0-9]/.test(registerForm.password)) {
        errors.password = '密码必须包含字母和数字';
        isValid = false;
      }

      // 验证确认密码
      if (!registerForm.confirmedPassword) {
        errors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (registerForm.password !== registerForm.confirmedPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }

      // 验证服务条款
      if (!registerForm.agreeTerms) {
        errors.agreeTerms = '请阅读并同意服务条款和隐私政策';
        isValid = false;
      }

      return isValid;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      isLoading.value = true;

      try {
        // =================== API调用区域 ===================
        // 调用后端注册API
        $.ajax({
          url: API_ENDPOINTS.USER.REGISTER,
          type: 'POST',
          data: {
            username: registerForm.username,
            email: registerForm.email,
            password: registerForm.password,
            confirmedPassword: registerForm.confirmedPassword
          },
          xhrFields: {
            withCredentials: true  // 如果需要发送 cookie
          },
          success: function(data) {
            if(data.error_msg === 'success'){
              console.log(data.error_msg);
              isLoading.value = false;
              proxy.$message.success('注册成功！请登录您的账号');
              router.push({name: 'login'});
            }
          },
          error: function(data,xhr) {
            console.log(data.error_msg)
            const errorData = xhr.responseJSON || {};
            throw new Error(errorData.message || '注册失败');
          }
        });
        // =================== API调用区域结束 ===================

      } catch (error) {
        console.error('注册失败:', error);
        isLoading.value = false;
        proxy.$message.error('注册失败: ' + (error.message || '请稍后重试'));
      }
    };

    return {
      registerForm,
      errors,
      isLoading,
      showPassword,
      togglePassword,
      validateForm,
      handleRegister
    };
  }
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

.register-container {
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

.register-card {
  width: 100%;
  max-width: 500px;
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

.register-card:hover {
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
  background: linear-gradient(135deg, #9b7ade 0%, #6a9eda 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(155, 122, 222, 0.4);
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

.password-hint {
  color: #888;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
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

.terms-check {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(106, 158, 218, 0.05);
  border-radius: 10px;
}

.terms-link, .privacy-link {
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.terms-link {
  color: #6a9eda;
}

.privacy-link {
  color: #9b7ade;
}

.register-btn {
  background: linear-gradient(45deg, #9b7ade, #6a9eda);
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
  margin-top: 1rem;
}

.register-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6a9eda, #9b7ade);
  transition: all 0.4s ease;
  z-index: -1;
}

.register-btn:hover:before {
  left: 0;
}

.register-btn:hover {
  box-shadow: 0 8px 20px rgba(106, 158, 218, 0.4);
  transform: translateY(-3px);
}

.register-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(106, 158, 218, 0.2);
}

.register-btn:disabled {
  background: #a0a0a0;
  transform: none;
  box-shadow: none;
}

.register-btn .btn-text {
  position: relative;
  z-index: 2;
}

.login-link {
  color: #9b7ade;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.login-link i {
  opacity: 0;
  margin-left: 2px;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #8a6ad0;
  text-decoration: none;
}

.login-link:hover i {
  opacity: 1;
  transform: translateX(3px);
}

a {
  color: #6a9eda;
  transition: all 0.3s ease;
  text-decoration: none;
}

a:hover {
  color: #5a8ec4;
}
</style>
