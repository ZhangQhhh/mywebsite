<template>
  <Content>
    <div class="register-container">
      <div class="card register-card">
        <div class="card-body">
          <h2 class="text-center mb-4">创建账号</h2>
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="username" class="form-label">用户名</label>
              <input
                type="text"
                class="form-control"
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

            <div class="mb-3">
              <label for="email" class="form-label">邮箱</label>
              <input
                type="email"
                class="form-control"
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

            <div class="mb-3">
              <label for="password" class="form-label">密码</label>
              <div class="input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  id="password"
                  v-model="registerForm.password"
                  placeholder="请输入密码"
                  :class="{'is-invalid': errors.password}"
                  required
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
              <div class="form-text">密码长度至少6位，包含字母和数字</div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">确认密码</label>
              <input
                type="password"
                class="form-control"
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

            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="agreeTerms" v-model="registerForm.agreeTerms">
              <label class="form-check-label" for="agreeTerms">我已阅读并同意<a href="#">服务条款</a>和<a href="#">隐私政策</a></label>
              <div class="invalid-feedback d-block" v-if="errors.agreeTerms">
                {{ errors.agreeTerms }}
              </div>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary" :disabled="isLoading || !registerForm.agreeTerms">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? '注册中...' : '注册' }}
              </button>
            </div>
          </form>

          <div class="text-center mt-3">
            <p>已有账号？ <router-link :to="{name: 'login'}">立即登录</router-link></p>
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

            //  router.push({name: 'login'});
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  background: linear-gradient(135deg, #6a9eda 0%, #9b7ade 100%);
  padding: 2rem;
}

.register-card {
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

.register-card:hover {
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
  border-color: #5a8ec4;
}

a {
  color: #6a9eda;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
