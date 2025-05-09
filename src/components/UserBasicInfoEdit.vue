<template>
  <div class="basic-info-card">
    <div class="card-header bg-gradient">
      <h3 class="mb-0">
        <i class="bi bi-person-lines-fill"></i> 基本资料
      </h3>
    </div>
    
    <div class="card-body">
      <!-- 邮箱修改表单 -->
      <form @submit.prevent="updateEmail" class="mb-4 pb-4 border-bottom">
        <h4 class="mb-3 text-primary"><i class="bi bi-envelope-check"></i> 邮箱设置</h4>
        
        <div class="mb-3">
          <label for="email" class="form-label">
            <i class="bi bi-envelope"></i> 邮箱
          </label>
          <div class="input-group">
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              v-model="emailInfo.email"
              :placeholder="user.email || '请输入邮箱'"
              :class="{'is-invalid': emailInfo.email && !isValidEmail}"
            >
          </div>
          <div class="invalid-feedback" v-if="emailInfo.email && !isValidEmail">
            请输入有效的邮箱地址
          </div>
          <div class="form-text" v-else>用于接收重要通知和找回密码</div>
        </div>
        
        <!-- 验证码输入 -->
        <div class="mb-3" v-if="showVerificationCode">
          <label for="verificationCode" class="form-label">
            <i class="bi bi-shield-lock"></i> 验证码
          </label>
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              id="verificationCode" 
              v-model="emailInfo.verificationCode"
              placeholder="请输入验证码"
            >
            <button 
              class="btn btn-outline-primary" 
              type="button" 
              @click="sendVerificationCode"
              :disabled="cooldown > 0"
            >
              {{ cooldown > 0 ? `重新发送(${cooldown}s)` : '获取验证码' }}
            </button>
          </div>
          <div class="form-text">验证码已发送至您的邮箱，有效期50分钟</div>
        </div>

        <!-- 邮箱提交按钮 -->
        <div class="d-flex justify-content-end">
          <button 
            type="button" 
            class="btn btn-primary"
            :disabled="isEmailSubmitting || !hasEmailChanges"
            @click="showVerificationCode ? updateEmail() : requestVerificationCode()"
          >
            <span v-if="isEmailSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            {{ showVerificationCode ? '确认修改' : '修改邮箱' }}
          </button>
        </div>

        <!-- 邮箱提示消息 -->
        <div v-if="emailMessage.show" :class="['alert mt-3', `alert-${emailMessage.type}`]" role="alert">
          {{ emailMessage.text }}
        </div>
      </form>

      <!-- 其他信息修改表单 -->
      <form @submit.prevent="updateUserInfo">
        <h4 class="mb-3 text-primary"><i class="bi bi-person-badge"></i> 个人资料</h4>
        
        <!-- 地区 -->
        <div class="mb-3">
          <label for="location" class="form-label">
            <i class="bi bi-geo-alt"></i> 所在地区
          </label>
          <input 
            type="text" 
            class="form-control" 
            id="location" 
            v-model="userInfo.location"
            :placeholder="user.location || '请输入所在地区'"
          >
        </div>

        <!-- 个人简介 -->
        <div class="mb-3">
          <label for="bio" class="form-label">
            <i class="bi bi-journal-text"></i> 个人简介
          </label>
          <textarea 
            class="form-control" 
            id="bio" 
            rows="4" 
            v-model="userInfo.bio"
            :placeholder="user.bio || '介绍一下自己吧...'"
          ></textarea>
          <div class="form-text text-end">{{ bioLength }}/200</div>
        </div>

        <!-- 提交按钮 -->
        <div class="d-flex justify-content-end">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting || !hasChanges"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>

        <!-- 提示消息 -->
        <div v-if="message.show" :class="['alert mt-3', `alert-${message.type}`]" role="alert">
          {{ message.text }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { updateUserInfo, updateEmail, sendVerificationCode, showMessage } from '@/api/profile'

export default {
  name: 'UserBasicInfoEdit',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const isSubmitting = ref(false)
    const isEmailSubmitting = ref(false)
    const showVerificationCode = ref(false)
    
    // 从localStorage获取冷却时间，如果存在的话
    const getCooldownFromStorage = () => {
      const storedCooldown = localStorage.getItem('emailVerificationCooldown')
      if (!storedCooldown) return 0
      
      const cooldownData = JSON.parse(storedCooldown)
      const now = new Date().getTime()
      
      // 如果过期时间已过，返回0
      if (now >= cooldownData.expiry) {
        localStorage.removeItem('emailVerificationCooldown')
        return 0
      }
      
      // 返回剩余秒数
      return Math.ceil((cooldownData.expiry - now) / 1000)
    }
    
    const cooldown = ref(getCooldownFromStorage())
    
    // 如果有冷却时间，启动计时器
    if (cooldown.value > 0) {
      const timer = setInterval(() => {
        cooldown.value--
        if (cooldown.value <= 0) {
          clearInterval(timer)
          localStorage.removeItem('emailVerificationCooldown')
        }
      }, 1000)
    }
    
    // 邮箱相关信息
    const emailInfo = reactive({
      email: '',
      verificationCode: ''
    })
    
    // 其他用户信息
    const userInfo = reactive({
      location: '',
      bio: ''
    })

    // 消息提示
    const message = reactive({
      show: false,
      text: '',
      type: 'success'
    })
    
    const emailMessage = reactive({
      show: false,
      text: '',
      type: 'success'
    })

    // 计算字数
    const bioLength = computed(() => userInfo.bio.length)

    // 检查是否有变更 - 基本信息
    const hasChanges = computed(() => {
      return userInfo.location !== props.user.location ||
             userInfo.bio !== props.user.bio
    })
    
    // 检查邮箱是否有变更
    const hasEmailChanges = computed(() => {
      return emailInfo.email && emailInfo.email !== props.user.email
    })

    // 验证邮箱格式
    const isValidEmail = computed(() => {
      if (!emailInfo.email) return true // 空值不显示错误
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(emailInfo.email)
    })

    // 显示消息 - 基本信息
    const showBasicMessage = (text, type = 'success') => {
      showMessage(message, text, type)
    }
    
    // 显示消息 - 邮箱
    const showEmailMessageFunc = (text, type = 'success') => {
      showMessage(emailMessage, text, type)
    }
    
    // 请求验证码
    const requestVerificationCode = () => {
      if (!hasEmailChanges.value) return
      
      // 添加邮箱格式验证
      if (!isValidEmail.value) {
        showEmailMessageFunc('请输入有效的邮箱地址', 'danger')
        return
      }
      
      showVerificationCode.value = true
      sendVerificationCodeFunc()
    }
    
    // 发送验证码
    const sendVerificationCodeFunc = async () => {
      if (cooldown.value > 0) return
      
      isEmailSubmitting.value = true
      
      // 设置冷却时间（60秒）
      cooldown.value = 60
      
      // 存储冷却时间到localStorage
      const now = new Date().getTime()
      const expiry = now + (cooldown.value * 1000)
      localStorage.setItem('emailVerificationCooldown', JSON.stringify({
        expiry: expiry
      }))
      
      // 启动倒计时
      const timer = setInterval(() => {
        cooldown.value--
        if (cooldown.value <= 0) {
          clearInterval(timer)
          localStorage.removeItem('emailVerificationCooldown')
        }
      }, 1000)
      
      try {
        await sendVerificationCode({
          email: emailInfo.email,
          userId: props.user.id
        })
        showEmailMessageFunc('验证码已发送至您的邮箱，请查收')
      } catch (error) {
        showEmailMessageFunc(error.message || '验证码发送失败，请稍后重试', 'danger')
        showVerificationCode.value = false
        // 如果发送失败，重置冷却时间
        cooldown.value = 0
        localStorage.removeItem('emailVerificationCooldown')
      } finally {
        isEmailSubmitting.value = false
      }
    }
    
    // 更新邮箱
    const updateEmailFunc = async () => {
      if (!hasEmailChanges.value || !emailInfo.verificationCode) return
      
      isEmailSubmitting.value = true
      
      try {
        const response = await updateEmail({
          id: props.user.id,
          newEmail: emailInfo.email,
          verificationCode: emailInfo.verificationCode
        })

        if (response.success === true) {
          store.commit('updateUser', {
            ...props.user,
            email: emailInfo.email
          })
          
          showEmailMessageFunc('邮箱修改成功！')
          showVerificationCode.value = false
          emailInfo.verificationCode = ''
        } else {
          throw new Error(response.error_msg || '邮箱修改失败')
        }
      } catch (error) {
        showEmailMessageFunc(error.message || '邮箱修改失败，请稍后重试', 'danger')
      } finally {
        isEmailSubmitting.value = false
      }
    }

    // 更新用户信息
    const updateUserInfoFunc = async () => {
      if (!hasChanges.value) return
      
      isSubmitting.value = true
      
      try {
        console.log(props.user)
        const response = await updateUserInfo({
          id: props.user.id,
          location: userInfo.location || props.user.location,
          bio: userInfo.bio || props.user.bio
        })

        if (response.success === true) {
          store.commit('updateUser', {
            ...props.user,
            location: userInfo.location || props.user.location,
            bio: userInfo.bio || props.user.bio
          })
          
          showBasicMessage('保存成功！')
        } else {
          throw new Error(response.error_msg || '保存失败')
        }
      } catch (error) {
        showBasicMessage(error.message || '保存失败，请稍后重试', 'danger')
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      userInfo,
      emailInfo,
      isSubmitting,
      isEmailSubmitting,
      message,
      emailMessage,
      bioLength,
      hasChanges,
      hasEmailChanges,
      isValidEmail,
      updateUserInfo: updateUserInfoFunc,
      showVerificationCode,
      cooldown,
      requestVerificationCode,
      sendVerificationCode: sendVerificationCodeFunc,
      updateEmail: updateEmailFunc
    }
  }
}
</script>

<style scoped>
.basic-info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.basic-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #1f2937;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.card-header h3 {
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #111827;
}

.card-header h3 i {
  font-size: 1.6rem;
  color: #4f46e5;
}

.card-body {
  padding: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.form-label i {
  color: #6366f1;
  font-size: 1.1rem;
}

.form-control {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.form-control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background-color: white;
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-text {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: #e5e7eb;
  box-shadow: none;
  cursor: not-allowed;
}

.alert {
  margin-top: 1.5rem;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  border: none;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background-color: #ecfdf5;
  color: #047857;
}

.alert-danger {
  background-color: #fef2f2;
  color: #dc2626;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
  
  .card-header h3 {
    font-size: 1.2rem;
  }
  
  .form-control {
    padding: 0.6rem 0.8rem;
  }
  
  .btn-primary {
    padding: 0.6rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: 1.25rem;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .form-control {
    font-size: 0.9rem;
  }
  
  .btn-primary {
    width: 100%;
  }
}
</style>







