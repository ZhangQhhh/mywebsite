<template>
  <div class="card settings-card">
    <div class="card-header bg-gradient">
      <h3 class="mb-0 card-title">用户设置</h3>
    </div>
    <div class="card-body">
      <!-- 选项卡导航 -->
      <ul class="nav nav-pills nav-fill mb-4" id="settingsTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="password-tab" data-bs-toggle="tab" data-bs-target="#password" 
                  type="button" role="tab" aria-controls="password" aria-selected="false">
            <i class="bi bi-key"></i> 修改密码
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="avatar-tab" data-bs-toggle="tab" data-bs-target="#avatar" 
                  type="button" role="tab" aria-controls="avatar" aria-selected="true">
            <i class="bi bi-person-circle"></i> 更新头像
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="posts-tab" data-bs-toggle="tab" data-bs-target="#posts" 
                  type="button" role="tab" aria-controls="posts" aria-selected="false">
            <i class="bi bi-file-text"></i> 帖子管理
          </button>
        </li>
      </ul>
      
      <!-- 选项卡内容 -->
      <div class="tab-content p-3 card-content-wrapper" id="settingsTabsContent">
        <!-- 修改密码 -->
        <div class="tab-pane fade" id="password" role="tabpanel" aria-labelledby="password-tab">
          <form @submit.prevent="updatePassword" class="mt-3">
            <div class="mb-3">
              <label for="currentPassword" class="form-label">当前密码</label>
              <div class="input-group">
                <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control" 
                       id="currentPassword" v-model="passwordForm.currentPassword" required>
                <button class="btn btn-outline-secondary" type="button" @click="toggleCurrentPassword">
                  <i class="bi" :class="showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="newPassword" class="form-label">新密码</label>
              <div class="input-group">
                <input :type="showNewPassword ? 'text' : 'password'" class="form-control" 
                       id="newPassword" v-model="passwordForm.newPassword" required>
                <button class="btn btn-outline-secondary" type="button" @click="toggleNewPassword">
                  <i class="bi" :class="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              <div class="form-text">密码长度至少6位，必须包含字母和数字</div>
            </div>
            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">确认新密码</label>
              <div class="input-group">
                <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" 
                       id="confirmPassword" v-model="passwordForm.confirmPassword" required>
                <button class="btn btn-outline-secondary" type="button" @click="toggleConfirmPassword">
                  <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>
            
            <div v-if="passwordError" class="alert alert-danger" role="alert">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="alert alert-success" role="alert">
              {{ passwordSuccess }}
            </div>
            
            <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              保存修改
            </button>
          </form>
        </div>
        
        <!-- 更新头像 -->
        <div class="tab-pane fade show active" id="avatar" role="tabpanel" aria-labelledby="avatar-tab">
          <div class="mt-3 text-center">
            <div class="avatar-preview mb-4">
              <img :src="avatarPreview || user.photo || require('@/assets/mylogo.png')" alt="头像预览" class="user-avatar">
            </div>
            
            <div class="mb-4 upload-container">
              <label for="avatarUpload" class="form-label">选择新头像</label>
              <div class="custom-file-input-wrapper">
                <input class="form-control" type="file" id="avatarUpload" @change="handleAvatarChange" accept="image/*">
                <div class="form-text upload-hint">支持JPG、PNG格式，文件大小不超过2MB</div>
              </div>
            </div>
            
            <div v-if="avatarError" class="alert alert-danger" role="alert">
              {{ avatarError }}
            </div>
            
            <div v-if="avatarSuccess" class="alert alert-success" role="alert">
              {{ avatarSuccess }}
            </div>
            
            <button class="btn btn-primary btn-lg upload-btn" @click="uploadAvatar" :disabled="!avatarFile || avatarLoading">
              <span v-if="avatarLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i class="bi bi-cloud-upload me-2"></i>上传头像
            </button>
          </div>
        </div>
        
        <!-- 帖子管理 -->
        <div class="tab-pane fade" id="posts" role="tabpanel" aria-labelledby="posts-tab">
          <!-- 加载状态 -->
          <div v-if="postsLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2">正在加载帖子列表...</p>
          </div>
          
          <!-- 错误提示 -->
          <div v-else-if="postsError" class="alert alert-danger" role="alert">
            <h4 class="alert-heading">加载失败</h4>
            <p>{{ postsErrorMessage }}</p>
            <hr>
            <p class="mb-0">请检查网络连接或稍后再试。</p>
          </div>
          
          <!-- 帖子列表内容 -->
          <div v-else>
            <!-- 无数据提示 -->
            <div v-if="userPosts.length === 0" class="alert alert-info" role="alert">
              暂无帖子数据
            </div>
            
            <!-- 帖子管理列表 -->
            <div v-else class="posts-container">
              <div class="table-wrapper">
                <table class="table table-hover custom-table">
                  <thead>
                    <tr>
                      <th scope="col" style="width: 40%">标题</th>
                      <th scope="col">发布时间</th>
                      <th scope="col">阅读量</th>
                      <th scope="col" class="action-column">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="post in userPosts" :key="post.postId" class="post-item">
                      <td class="text-truncate post-title" style="max-width: 200px;" :title="post.postTitle">
                        <i class="bi bi-file-earmark-text me-2"></i>{{ post.postTitle }}
                      </td>
                      <td>
                        <span class="date-badge">
                          <i class="bi bi-calendar-date me-1"></i>{{ formatDate(post.createTime) }}
                        </span>
                      </td>
                      <td>
                        <span class="views-badge">
                          <i class="bi bi-eye me-1"></i>{{ post.postViews || 0 }}
                        </span>
                      </td>
                      <td>
                        <div class="action-buttons" role="group">
                          <button type="button" class="btn btn-action btn-edit" @click="editPost(post.postId)" title="编辑帖子">
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button type="button" class="btn btn-action btn-delete" @click="confirmDeletePost(post)" title="删除帖子">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 分页导航 -->
              <nav v-if="userPosts.length > 0" aria-label="帖子分页" class="my-4">
                <ul class="pagination pagination-custom justify-content-center">
                  <!-- 上一页按钮 -->
                  <li class="page-item" :class="{ disabled: postsCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage - 1)" aria-label="上一页">
                      <i class="bi bi-chevron-left"></i>
                    </a>
                  </li>
                  
                  <!-- 页码按钮 -->
                  <li v-for="page in postsDisplayedPages" 
                      :key="page" 
                      class="page-item" 
                      :class="{ active: postsCurrentPage === page }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(page)">{{ page }}</a>
                  </li>
                  
                  <!-- 下一页按钮 -->
                  <li class="page-item" :class="{ disabled: postsCurrentPage === postsTotalPages }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage + 1)" aria-label="下一页">
                      <i class="bi bi-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- 22222222222222 -->
          </div>
          
          <!-- 删除确认对话框 -->
          <div class="modal fade" id="deletePostModal" tabindex="-1" aria-labelledby="deletePostModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="deletePostModalLabel">确认删除</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>您确定要删除帖子 <strong>{{ postToDelete?.postTitle }}</strong> 吗？</p>
                  <p class="text-danger">此操作不可撤销！</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                  <button type="button" class="btn btn-danger" @click="deletePost" :disabled="deleteLoading">
                    <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { getUserPosts } from '@/api/post';
import { updateAvatar, deleteUserPost,updateUserPassword } from '@/api/profile';
import {  useStore } from 'vuex';
export default {
  name: 'UserProfileSettings',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    
    // 获取应用实例，用于访问全局属性
    const { proxy } = getCurrentInstance();
    
    // 检查Bootstrap是否可用
    onMounted(() => {
      if (!window.bootstrap) {
        console.warn('Bootstrap JavaScript 未正确加载，将使用备选方案处理模态框');
      }
    });
    // ===== 密码修改相关 =====
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    const passwordLoading = ref(false);
    const passwordError = ref('');
    const passwordSuccess = ref('');
    
    const toggleCurrentPassword = () => {
      showCurrentPassword.value = !showCurrentPassword.value;
    };
    
    const toggleNewPassword = () => {
      showNewPassword.value = !showNewPassword.value;
    };
    
    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };
    
    const updatePassword = async () => {
      // 重置消息
      passwordError.value = '';
      passwordSuccess.value = '';
      
      // 表单验证
      if (!passwordForm.value.currentPassword) {
        passwordError.value = '请输入当前密码';
        return;
      }
      
      if (!passwordForm.value.newPassword) {
        passwordError.value = '请输入新密码';
        return;
      }
      
      if (passwordForm.value.newPassword.length < 6) {
        passwordError.value = '密码长度不能少于6位';
        return;
      }
      
      if (!/[A-Za-z]/.test(passwordForm.value.newPassword) || !/[0-9]/.test(passwordForm.value.newPassword)) {
        passwordError.value = '密码必须包含字母和数字';
        return;
      }
      
      if (!passwordForm.value.confirmPassword) {
        passwordError.value = '请确认新密码';
        return;
      }
      
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordError.value = '两次输入的密码不一致';
        return;
      }
      
      // 发送请求
      passwordLoading.value = true;
      
      try {
        // 调用API修改密码
        const response = await updateUserPassword(
          {
            currentPassword: passwordForm.value.currentPassword,
            newPassword: passwordForm.value.newPassword
          },
          props.user.id
        );
        if (response.error_msg === 'success') {
          passwordSuccess.value = '密码修改成功！';
          passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        } else {
          throw new Error(response.error_msg || '密码修改失败');
        }
      } catch (error) {
        passwordError.value = error.message || '密码修改失败，请稍后重试';
      } finally {
        passwordLoading.value = false;
      }
    };
    
    // ===== 头像更新相关 =====
    const avatarFile = ref(null);
    const avatarPreview = ref('');
    const avatarLoading = ref(false);
    const avatarError = ref('');
    const avatarSuccess = ref('');
    
    const handleAvatarChange = (event) => {
      const file = event.target.files[0];
      avatarError.value = '';
      avatarSuccess.value = '';
      
      if (!file) {
        avatarFile.value = null;
        avatarPreview.value = '';
        return;
      }
      
      // 验证文件类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        avatarError.value = '只支持JPG和PNG格式的图片';
        event.target.value = '';
        return;
      }
      
      // 验证文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        avatarError.value = '图片大小不能超过2MB';
        event.target.value = '';
        return;
      }
      
      avatarFile.value = file;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    const uploadAvatar = async () => {
      if (!avatarFile.value) return;
      
      avatarLoading.value = true;
      avatarError.value = '';
      avatarSuccess.value = '';
      
      try {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('avatar', avatarFile.value);
        
        // 调用API上传头像
        const response = await updateAvatar(formData, props.user.id);
        
        if (response.error_msg === 'success') {
          // 如果后端返回了更新后的用户信息，可以更新Vuex中的头像
          if (response.user && response.user.photo) {
            // 假设有一个更新用户信息的Vuex action或mutation
             store.commit('updateUser', { ...props.user, photo: response.user.photo });
          } else {
            // 如果后端没有返回更新后的用户信息，使用本地预览图
             store.commit('updateUser', { ...props.user, photo: avatarPreview.value });
          }
          
          avatarSuccess.value = '头像上传成功！';
        } else {
          throw new Error(response.error_msg || '头像上传失败');
        }
      } catch (error) {
        avatarError.value = error.message || '头像上传失败，请稍后重试';
      } finally {
        avatarLoading.value = false;
      }
    };
    
    // ===== 帖子管理相关 =====
    const userPosts = ref([]);
    const postsLoading = ref(true);
    const postsError = ref(false);
    const postsErrorMessage = ref('');
    const postsCurrentPage = ref(1);
    const postsPageSize = ref(4); // 改小一点，比如每页显示3条 
    const postsTotalItems = ref(0); // 帖子总数
    const postsTotalPages = ref(0);// 帖子总页数
    const postToDelete = ref(null); // 要删除的帖子
    const deleteLoading = ref(false);
    
    // 计算属性：显示哪些页码按钮
    const postsDisplayedPages = computed(() => {
      const maxPagesToShow = 5;
      const pages = [];
      
      // 计算显示的页码范围
      let startPage = Math.max(1, postsCurrentPage.value - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(postsTotalPages.value, startPage + maxPagesToShow - 1);
      
      // 调整起始页，确保显示足够的页码
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      // 生成页码数组
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    });
    
    // 加载用户帖子列表数据
    const loadUserPosts = async () => {
      postsLoading.value = true;
      postsError.value = false;
      
      try {
        // 调用API获取用户帖子列表，传入分页参数
        const response = await getUserPosts(
          {
            pageNum: postsCurrentPage.value,
            pageSize: postsPageSize.value
          },
          props.user.id
        );
        
        if (response.error_msg === 'success') {
          userPosts.value = response.posts;
          postsTotalItems.value = response.total_posts;
          postsTotalPages.value = Math.ceil(response.total_posts / postsPageSize.value);
        } else {
          throw new Error(response.error_msg || '获取帖子列表失败');
        }
      } catch (error) {
        console.error('加载用户帖子失败:', error);
        postsError.value = true;
        postsErrorMessage.value = error.message || '获取帖子列表失败';
      } finally {
        postsLoading.value = false;
      }
    };
    
    // 切换页码
    const changePostsPage = (page) => {
      if (page < 1 || page > postsTotalPages.value) return;
      postsCurrentPage.value = page;
      loadUserPosts();
    };
    
    // 编辑帖子
    const editPost = (postId) => {
      router.push(`/post/edit/${postId}`);
    };
    
    // 确认删除帖子
    const confirmDeletePost = (post) => {
      postToDelete.value = post;
      // 使用Bootstrap的Modal API显示确认对话框
      // 检查window.bootstrap是否存在
      // 确保DOM元素存在
      const modalElement = document.getElementById('deletePostModal');
      if  (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      } else {
        // 如用bootstrap对象不可用，使用DOM API手动显示模态框
        const modalElement = document.getElementById('deletePostModal');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          modalElement.setAttribute('aria-modal', 'true');
          modalElement.setAttribute('role', 'dialog');
          document.body.classList.add('modal-open');
          
          // 创建背景遮罩
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
          
          // 手动绑定关闭事件
          const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
          closeButtons.forEach(button => {
            button.addEventListener('click', () => closeModal());
          });
          
          // 点击取消按钮关闭模态框
          const cancelButton = modalElement.querySelector('.btn-secondary');
          if (cancelButton) {
            cancelButton.addEventListener('click', () => closeModal());
          }
        }
      }
    };
    
    // 手动关闭模态框的函数
    const closeModal = () => {
      const modalElement = document.getElementById('deletePostModal');
      if (modalElement&&window.bootstrap && window.bootstrap.Modal) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      } else {
        // 手动关闭模态框
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          modalElement.removeAttribute('aria-modal');
          modalElement.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('modal-open');
          
          // 移除背景遮罩
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            document.body.removeChild(backdrop);
          }
        }
      }
    };
    
    // 删除帖子
    const deletePost = async () => {
      if (!postToDelete.value) return;
      
      deleteLoading.value = true;
      
      try {
        // 调用API删除帖子
        const response = await deleteUserPost(postToDelete.value.postId);
        
        if (response.error_msg === 'success') {
          // 关闭对话框
          closeModal();
          
          // 重新加载帖子列表
          await loadUserPosts();
        } else {
          throw new Error(response.error_msg || '删除帖子失败');
        }
      } catch (error) {
        console.error('删除帖子失败:', error);
        // 获取错误信息，优先使用后端返回的error_msg
        const errorMsg = error.response?.error_msg || error.message || '未知错误';
        
        // 在模态框中显示错误信息，而不是使用alert
        const modalBody = document.querySelector('#deletePostModal .modal-body');
        if (modalBody) {
          // 保存原始内容
          const originalContent = modalBody.innerHTML;
          
          // 添加错误信息
          modalBody.innerHTML = `
            <div class="alert alert-danger" role="alert">
              <h5 class="alert-heading">删除失败</h5>
              <p>${errorMsg}</p>
            </div>
            ${originalContent}
          `;
          
          // 3秒后恢复原始内容
          setTimeout(() => {
            modalBody.innerHTML = originalContent;
          }, 3000);
        } else {
          // 如果找不到模态框，则回退到alert
          proxy.$message.error(`删除帖子失败: ${errorMsg}`);
        }
        
        // 关闭模态框
        closeModal();
      } finally {
        // 无论成功或失败，都重置加载状态
        deleteLoading.value = false;
        // 重置删除对象
        postToDelete.value = null;
      }
    }
    
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
    };
    
    // 监听用户ID变化，重新加载帖子
    watch(() => props.user.id, () => {
      if (props.user.id) {
        loadUserPosts();
      }
    });
    
    // 组件挂载时加载帖子
    onMounted(() => {
      if (props.user.id) {
        loadUserPosts();
      }
    });
    
    return {
      // 密码相关
      passwordForm,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordLoading,
      passwordError,
      passwordSuccess,
      toggleCurrentPassword,
      toggleNewPassword,
      toggleConfirmPassword,
      updatePassword,
      
      // 头像相关
      avatarFile,
      avatarPreview,
      avatarLoading,
      avatarError,
      avatarSuccess,
      handleAvatarChange,
      uploadAvatar,
      
      // 帖子管理相关
      userPosts,
      postsLoading,
      postsError,
      postsErrorMessage,
      postsCurrentPage,
      postsTotalPages,
      postsDisplayedPages,
      postToDelete,
      deleteLoading,
      loadUserPosts,
      changePostsPage,
      editPost,
      confirmDeletePost,
      deletePost,
      formatDate
    };
  }
};
</script>

<style scoped>
.settings-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-card:hover {
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

.card-title {
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #111827;
}

.card-title i {
  font-size: 1.6rem;
  color: #4f46e5;
}

.card-body {
  padding: 2rem;
}

.nav-pills {
  margin-bottom: 2rem;
}

.nav-pills .nav-link {
  color: #495057;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.nav-pills .nav-link.active {
  color: #fff;
  background: linear-gradient(45deg, #007bff, #5a9de0);
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
  transform: translateY(-2px);
}

.nav-pills .nav-link i {
  margin-right: 8px;
  font-size: 1.1rem;
}

.card-content-wrapper {
  background-color: #f8f9fa;
  border-radius: 10px;
  min-height: 350px;
}

.avatar-preview {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  border: 5px solid #fff;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.upload-container {
  max-width: 500px;
  margin: 0 auto;
}

.custom-file-input-wrapper {
  position: relative;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-hint {
  margin-top: 0.5rem;
  color: #6c757d;
  font-style: italic;
}

.upload-btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.upload-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.posts-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  overflow: hidden;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #adb5bd #f8f9fa;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background-color: #adb5bd;
  border-radius: 10px;
  border: 2px solid #f8f9fa;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #6c757d;
}

.custom-table {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 650px; /* 确保表格不会过度压缩 */
  width: 100%;
}

.custom-table thead {
  background-color: #f8f9fa;
}

.custom-table th {
  font-weight: 600;
  color: #495057;
  padding: 1rem;
  border-top: none;
  border-bottom: 2px solid #e9ecef;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.7px;
}

.custom-table td {
  padding: 1rem;
  vertical-align: middle;
  border-top: none;
  border-bottom: 1px solid #f1f3f5;
}

.post-item {
  transition: all 0.2s ease;
}

.post-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.post-title {
  font-weight: 500;
  color: #343a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  display: inline-block;
}

.date-badge, .views-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 50px;
  font-size: 0.85rem;
  background-color: #f8f9fa;
  color: #6c757d;
}

.date-badge {
  background-color: #e7f5ff;
  color: #1971c2;
}

.views-badge {
  background-color: #fff9db;
  color: #e67700;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-edit {
  background-color: #4dabf7;
  border-color: #4dabf7;
}

.btn-edit:hover {
  background-color: #339af0;
  border-color: #339af0;
}

.btn-delete {
  background-color: #ff8787;
  border-color: #ff8787;
}

.btn-delete:hover {
  background-color: #fa5252;
  border-color: #fa5252;
}

.action-column {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.pagination-custom {
  margin-top: 2rem;
}

.pagination-custom .page-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 5px;
  color: #4a69bb;
  background-color: #fff;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pagination-custom .page-link:hover {
  background-color: #e7f5ff;
  color: #1864ab;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pagination-custom .page-item.active .page-link {
  background: linear-gradient(45deg, #4a69bb, #6c5b7b);
  color: #fff;
  box-shadow: 0 4px 8px rgba(74, 105, 187, 0.3);
}

.pagination-custom .page-item.disabled .page-link {
  color: #adb5bd;
  pointer-events: none;
  background-color: #f1f3f5;
  box-shadow: none;
}

/* 动画效果 */
.tab-pane {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
  
  .nav-pills .nav-link {
    margin: 0 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .avatar-preview {
    width: 150px;
    height: 150px;
  }
  
  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .custom-table {
    min-width: 550px;
  }
  
  .posts-container {
    padding: 1rem;
  }
  
  .post-title {
    max-width: 150px;
  }
  
  .date-badge, .views-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .action-column {
    width: 80px;
    min-width: 80px;
  }
}

@media (max-width: 576px) {
  .custom-table {
    min-width: 450px;
  }
  
  .post-title {
    max-width: 120px;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .btn-action {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .action-column {
    width: 70px;
    min-width: 70px;
  }
}
</style>
