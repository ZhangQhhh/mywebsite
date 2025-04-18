<template>
  <div class="card settings-card">
    <div class="card-body">
      <h3 class="mb-4">用户设置</h3>
      
      <!-- 选项卡导航 -->
      <ul class="nav nav-tabs" id="settingsTabs" role="tablist">
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
      <div class="tab-content p-3 border border-top-0 rounded-bottom" id="settingsTabsContent">
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
            <div class="avatar-preview mb-3">
              <img :src="avatarPreview || user.photo || require('@/assets/mylogo.png')" alt="头像预览" class="img-thumbnail">
            </div>
            
            <div class="mb-3">
              <label for="avatarUpload" class="form-label">选择新头像</label>
              <input class="form-control" type="file" id="avatarUpload" @change="handleAvatarChange" accept="image/*">
              <div class="form-text">支持JPG、PNG格式，文件大小不超过2MB</div>
            </div>
            
            <div v-if="avatarError" class="alert alert-danger" role="alert">
              {{ avatarError }}
            </div>
            
            <div v-if="avatarSuccess" class="alert alert-success" role="alert">
              {{ avatarSuccess }}
            </div>
            
            <button class="btn btn-primary" @click="uploadAvatar" :disabled="!avatarFile || avatarLoading">
              <span v-if="avatarLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              上传头像
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
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col" style="width: 40%">标题</th>
                    <th scope="col">发布时间</th>
                    <th scope="col">阅读量</th>
                    <th scope="col">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="post in userPosts" :key="post.postId">
                    <td class="text-truncate" style="max-width: 200px;" :title="post.postTitle">{{ post.postTitle }}</td>
                    <td>{{ formatDate(post.createTime) }}</td>
                    <td>{{ post.postViews || 0 }}</td>
                    <td>
                      <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" @click="editPost(post.postId)">
                          <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button type="button" class="btn btn-outline-danger" @click="confirmDeletePost(post)">
                          <i class="bi bi-trash"></i> 删除
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- 分页导航 -->
              <nav v-if="postsTotalPages > 1" aria-label="帖子分页" class="my-4">
                <ul class="pagination justify-content-center">
                  <!-- 上一页按钮 -->
                  <li class="page-item" :class="{ disabled: postsCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage - 1)" aria-label="上一页">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  
                  <!-- 页码按钮 -->
                  <li v-for="page in postsDisplayedPages" :key="page" class="page-item" :class="{ active: postsCurrentPage === page }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(page)">{{ page }}</a>
                  </li>
                  
                  <!-- 下一页按钮 -->
                  <li class="page-item" :class="{ disabled: postsCurrentPage === postsTotalPages }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage + 1)" aria-label="下一页">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
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
    const postsPageSize = ref(5);
    const postsTotalItems = ref(0);
    const postsTotalPages = ref(0);
    const postToDelete = ref(null);
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
      console.log( window.bootstrap);
      // 确保DOM元素存在
      const modalElement = document.getElementById('deletePostModal');
      if  (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement);
        console.log("确实存在《Modal》");
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
  margin-top: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.nav-tabs .nav-link {
  color: #495057;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  font-weight: 600;
}

.nav-tabs .nav-link i {
  margin-right: 5px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

.btn-group .btn {
  transition: all 0.2s;
}

.btn-group .btn:hover {
  transform: translateY(-2px);
}

/* 动画效果 */
.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>