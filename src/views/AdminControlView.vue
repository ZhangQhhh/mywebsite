<template>
  <Content>
    <div class="admin-panel">
      <h1 class="admin-title">管理员控制面板</h1>

      <!-- 搜索和过滤区域 -->
      <div class="search-filter-section">
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="搜索用户名" v-model="searchQuery" @input="handleSearch">
          <div class="input-group-append">
            <button class="btn btn-primary" type="button" @click="handleSearch">搜索</button>
          </div>
        </div>
        <div class="filter-options">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="showBanned" v-model="filters.showBanned">
            <label class="form-check-label" for="showBanned">显示已封禁用户</label>
          </div>
        </div>
      </div>

      <!-- 用户列表表格 -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="thead-light">
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>积分</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center">加载中...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="5" class="text-center text-danger">{{ errorMessage }}</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center">没有找到用户</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'table-danger': user.status === '0' }">
              <td>{{ user.id }}</td>
              <td>
                <div class="user-info">
                  <img :src="user.photo || 'https://via.placeholder.com/40'" class="user-avatar" alt="用户头像">
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>{{ user.score || 0 }}</td>
              <td>
                <span :class="String(user.status) === '0' ? 'badge bg-danger' : 'badge bg-success'">
                  {{ String(user.status) === '0' ? '已封禁' : '正常' }}
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm" :class="String(user.status) === '0' ? 'btn-success' : 'btn-danger'"
                    @click="(event) => toggleUserBan(user, event)">
                    <!-- 状态为 '0' 表示已封禁，显示解除封禁按钮 -->
                    <!-- 状态为 '1' 表示正常，显示封禁用户按钮 -->
                    {{ String(user.status) === '0' ? '解除封禁' : '封禁用户' }}
                  </button>
                  <button class="btn btn-sm btn-warning" @click="showResetPasswordModal(user)">重置密码</button>
                  <button class="btn btn-sm btn-info" @click="viewUserPosts(user)">查看帖子</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container" v-if="!loading && !error && totalPages > 1">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">&laquo;</a>
            </li>
            <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">&raquo;</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- 重置密码模态框 -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-labelledby="resetPasswordModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="resetPasswordModalLabel">重置用户密码</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>您正在为用户 <strong>{{ selectedUser?.username }}</strong> 重置密码</p>
            <div class="mb-3">
              <label for="newPassword" class="form-label">新密码</label>
              <input type="password" class="form-control" id="newPassword" v-model="newPassword">
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">确认密码</label>
              <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword">
              <div class="form-text text-danger" v-if="passwordError">{{ passwordError }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="resetPassword">确认重置</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户帖子模态框 -->
    <div class="modal fade" id="userPostsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedUser?.username }}的帖子</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingPosts" class="text-center">
              <p>加载中...</p>
            </div>
            <div v-else-if="postsError" class="text-center text-danger">
              <p>{{ postsErrorMessage }}</p>
            </div>
            <div v-else-if="userPosts.length === 0" class="text-center">
              <p>该用户暂无帖子</p>
            </div>
            <div v-else>
              <div class="list-group">
                <div v-for="post in userPosts" :key="post.postId" class="list-group-item">
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ post.postTitle }}</h5>
                    <small>{{ formatDate(post.createTime) }}</small>
                  </div>
                  <p class="mb-1">{{ truncateContent(post.postContent) }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <span class="me-2">阅读量: {{ post.postViews || 0 }}</span>
                      <span>收藏: {{ post.postCollects || 0 }}</span>
                    </small>
                    <button class="btn btn-sm btn-danger" @click="deletePost(post)">
                      删除帖子
                    </button>
                  </div>
                </div>
              </div>

              <!-- 分页控件 -->
              <nav v-if="postsTotalPages > 1" class="mt-3">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: postsCurrentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage - 1)">上一页</a>
                  </li>
                  <li v-for="page in postsDisplayedPages" :key="page" class="page-item"
                    :class="{ active: page === postsCurrentPage }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: postsCurrentPage === postsTotalPages }">
                    <a class="page-link" href="#" @click.prevent="changePostsPage(postsCurrentPage + 1)">下一页</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div class="modal fade" id="deletePostConfirmModal" tabindex="-1" aria-labelledby="deletePostConfirmModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deletePostConfirmModalLabel">确认删除帖子</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>您确定要删除这篇帖子吗？此操作不可撤销。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="confirmDeletePost">删除</button>
          </div>
        </div>
      </div>
    </div>
  </Content>
</template>

<script>
// @ is an alias to /src
import Content from '@/components/ContentBase';
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { deleteUserPost } from '@/api/profile';
import { getUserList, resetUserPassword, banUser, unbanUser } from '@/api/admin';
import { getUserPosts } from '@/api/post';
import { ElMessage, ElMessageBox } from 'element-plus';
export default {
  name: 'AdminControlView',
  components: {
    Content
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const postsCurrentPage = ref(1); // 当前页码，默认从第一页开始
    const postsTotalPages = ref(1); // 总页数，根据总条数和每页条数计算得出
    const postsPageSize = ref(3);   // 每页显示的数据条数
    const postsTotalItems = ref(0);  // 数据总条数，从后端返回的总帖子数量


    // 获取应用实例，用于访问全局属性
    const { proxy } = getCurrentInstance();




    // 计算属性：显示哪些页码按钮
    const postsDisplayedPages = computed(() => {
      const maxPagesToShow = 5;
      const pages = [];
      let startPage = Math.max(1, postsCurrentPage.value - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(postsTotalPages.value, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    });



    // 检查是否是管理员
    const checkAdminAccess = () => {
      // 这里应该根据实际情况检查用户是否有管理员权限
      // 如果后端已经做了控制，这里可以简化或省略
      if (store.state.user.is_login === 'false') {
        proxy.$message.warning("请先登录！");
        router.push({ name: 'login' });
        return false;
      }

      // 如果需要在前端也做权限控制，可以添加额外的检查
      // 例如检查用户角色是否为管理员

      if (store.state.user.role !== 'ADMIN') {
        proxy.$message.warning("非法访问管理员页面！");
        router.push({ name: 'home' });
        return false;
      }

      return true;
    };

    // 用户列表数据
    const users = ref([]);
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref('');

    // 搜索和过滤
    const searchQuery = ref('');
    const filters = ref({
      showBanned: true
    });

    // 分页相关
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    const totalPages = ref(0);

    // 模态框相关
    const selectedUser = ref(null);
    const newPassword = ref('');
    const confirmPassword = ref('');
    const passwordError = ref('');

    // 用户帖子相关
    const userPosts = ref([]);
    const loadingPosts = ref(false);
    const postsError = ref(false);
    const postsErrorMessage = ref('');

    // 计算属性：过滤后的用户列表
    const filteredUsers = computed(() => {
      // 确保每次计算时都使用最新的users数组
      let result = [...users.value];

      // 确保所有用户的状态是字符串类型
      result = result.map(user => ({
        ...user,
        status: String(user.status)
      }));

      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.id.toString().includes(query)
        );
      }

      // 状态过滤
      if (!filters.value.showBanned) {
        result = result.filter(user => user.status === '1');
      }

      return result;
    });

    // 计算属性：显示哪些页码按钮
    const displayedPages = computed(() => {
      const maxPagesToShow = 5;
      const pages = [];

      // 计算显示的页码范围
      let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1);

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

    // 加载用户列表
    const loadUsers = async () => {
      if (!checkAdminAccess()) return;

      loading.value = true;
      error.value = false;

      try {
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value
        };
        const resp = await getUserList(params);

        if (resp.error_msg === 'success') {
          // 保存旧的用户列表，用于比较变化
          const oldUsers = [...users.value];

          // 确保所有用户的状态是字符串类型
          const updatedUsers = (resp.users || []).map(user => ({
            ...user,
            status: String(user.status)
          }));

          // 更新用户列表
          users.value = updatedUsers;
          totalItems.value = resp.total || 0;
          totalPages.value = Math.ceil(totalItems.value / pageSize.value);

          // 检查用户状态变化
          if (oldUsers.length > 0) {
            users.value.forEach(newUser => {
              const oldUser = oldUsers.find(u => u.id === newUser.id);
              if (oldUser && oldUser.status !== newUser.status) {
                console.log(`用户 ${newUser.username} 状态从 ${oldUser.status} 变为 ${newUser.status}`);
              }
            });
          }
        } else {
          error.value = true;
          errorMessage.value = resp.error_msg || '获取用户列表失败';
          console.error('获取用户列表失败:', resp.error_msg);
        }
      } catch (err) {
        console.error('加载用户列表出错:', err);
        error.value = true;
        errorMessage.value = '获取用户列表失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    };

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      loadUsers();
    };

    // 处理搜索
    const handleSearch = () => {
      // 如果是本地过滤，不需要重新加载数据
      // 如果需要从服务器搜索，则需要调用loadUsers
    };

    // 封禁/解封回调函数
    // const banCallback = (confirmed, user, buttonElement) => {
    //   // 传递按钮元素，便于在操作完成后更新按钮状态
    //   handleBanConfirmation(confirmed, user, buttonElement);
    // };

    // 封禁/解封用户
    const toggleUserBan = (user, event) => {
      // 防止事件冒泡和重复触发
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 防止重复点击
      const banButton = event?.target;
      if (banButton && banButton.disabled) {
        return;
      }

      // 禁用按钮防止重复点击
      if (banButton) {
        banButton.disabled = true;
      }

      const action = user.status === '0' ? '解除封禁' : '封禁';
      
      ElMessageBox.confirm(
        `确定要${action}用户 ${user.username}？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          // 用户点击确定按钮
          handleBanConfirmation(true, user, banButton);
        })
        .catch(() => {
          // 用户取消操作，重新启用按钮
          if (banButton) {
            banButton.disabled = false;
          }
          ElMessage({
            type: 'info',
            message: '操作已取消'
          });
        });
    };

    // 处理封禁确认后的操作
    const handleBanConfirmation = async (confirmed, user, buttonElement) => {
      if (!confirmed) return;

      try {
        const isCurrentlyBanned = String(user.status) === '0';
        const apiCall = isCurrentlyBanned ? unbanUser : banUser;

        const resp = await apiCall(user.id);
        console.log(resp)
        // 修改判断条件，检查 success 字段
        if (resp.success === true || resp.error_msg.includes('已经封禁')) {
          await loadUsers();
          if (buttonElement) {
            buttonElement.disabled = false;
          }
          proxy.$message.success(`已${isCurrentlyBanned ? '解除封禁' : '封禁'}用户 ${user.username}`);
        } else {
          proxy.$message.error(resp.error_msg || '操作失败，请重试');
        }
      } catch (error) {
        console.error('处理封禁操作时发生异常:', error);
        proxy.$message.error('操作失败，发生意外错误');
      }
    };

    // 监听器
    watch(
      () => filters.value.showBanned,
      () => {
        loadUsers();
      }
    );

    // 显示重置密码模态框
    // 显示重置密码模态框
    const showResetPasswordModal = (user) => {
      selectedUser.value = user;
      newPassword.value = '';
      confirmPassword.value = '';
      passwordError.value = '';
      // 使用全局的 bootstrap
      const modal = new window.bootstrap.Modal(document.getElementById('resetPasswordModal'));
      modal.show();
    };

    // 重置用户密码
    const resetPassword = () => {
      // 验证密码
      if (!newPassword.value) {
        passwordError.value = '请输入新密码';
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        passwordError.value = '两次输入的密码不一致';
        return;
      }

      if (newPassword.value.length < 6) {
        passwordError.value = '密码长度不能少于6位';
        return;
      }

      // 调用API重置密码
      const data = {
        userId: selectedUser.value.id,
        newPassword: newPassword.value
      };

      resetUserPassword(data)
        .then(resp => {
          if (resp.error_msg === 'success') {
            proxy.$message.success(`已成功重置用户 ${selectedUser.value.username} 的密码`);
            // 使用 Bootstrap 的方式关闭模态框
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
            modal.hide();
            // 清除错误信息
            passwordError.value = '';
          } else {
            passwordError.value = resp.error_msg || '重置密码失败';
          }
        })
        .catch(() => {
          passwordError.value = '重置密码失败，请稍后重试';
        });
    };

    // 使用viewUserPosts函数代替，因为它已经包含了显示模态框的功能

    // 查看用户帖子
    const viewUserPosts = (user, page = 1) => {
      selectedUser.value = user;
      loadingPosts.value = true;
      postsError.value = false;
      userPosts.value = [];
      postsCurrentPage.value = page;

      // 先显示模态框
      const modal = new window.bootstrap.Modal(document.getElementById('userPostsModal'));
      modal.show();

      // 使用Promise方式调用
      getUserPosts({
        pageNum: postsCurrentPage.value,
        pageSize: postsPageSize.value
      }, user.id)
        .then(response => {
          if (response.error_msg === 'success') {
            // 直接使用返回的帖子数组
            userPosts.value = response.posts;
            postsTotalItems.value = response.total;
            postsTotalPages.value = response.totalPages;
            // 移除成功消息提示，因为不需要
            // proxy.$message.success('获取帖子列表成功');
          } else {
            proxy.$message.error(response.error_msg || '获取帖子列表失败');
            postsError.value = true;
            postsErrorMessage.value = response.error_msg;
          }
        })
        .catch(error => {
          console.error('获取帖子失败:', error);
          proxy.$message.error(error.message || '获取帖子列表失败');
          postsError.value = true;
          postsErrorMessage.value = error.message;
        })
        .finally(() => {
          loadingPosts.value = false;
        });
    };

    // 添加切换页码方法
    const changePostsPage = (page) => {
      if (page < 1 || page > postsTotalPages.value) return;
      viewUserPosts(selectedUser.value, page);
    };

    // 添加一个用于确认删除的状态
    const postToDelete = ref(null);

    // 显示删除确认模态框
    const showDeleteConfirmModal = (post) => {
      postToDelete.value = post;
      const modalElement = document.getElementById('deletePostConfirmModal');
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      }
    };

    // 执行删除操作
    const confirmDeletePost = () => {
      if (!postToDelete.value) return;

      ElMessageBox.confirm(
        '确定要删除这篇帖子吗？此操作不可撤销。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          const postId = postToDelete.value.postId;
          deleteUserPost(postId)
            .then(response => {
              if (response.error_msg === 'success') {
                ElMessage({
                  type: 'success',
                  message: '删除成功'
                });
                // 重新加载当前页的帖子
                viewUserPosts(selectedUser.value, postsCurrentPage.value);
              } else {
                ElMessage({
                  type: 'error',
                  message: response.error_msg || '删除失败'
                });
              }
            })
            .catch(error => {
              console.error('删除帖子失败:', error);
              ElMessage({
                type: 'error',
                message: error.message || '删除失败'
              });
            })
            .finally(() => {
              postToDelete.value = null; // 重置删除状态
            });
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '删除已取消'
          });
          postToDelete.value = null; // 重置删除状态
        });
    };

    // 格式化日期函数，用于帖子创建时间的显示
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
    };

    // 截断内容
    const truncateContent = (content) => {
      if (!content) return '';
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    // 组件挂载时加载数据
    onMounted(() => {
      loadUsers();

      // 确保在组件挂载后初始化模态框
      const resetPasswordModal = document.getElementById('resetPasswordModal');
      if (resetPasswordModal) {
        new window.bootstrap.Modal(resetPasswordModal);
      }
    });

    // 删除帖子
    const deletePost = (post) => {
      ElMessageBox.confirm(
        '确定要删除这篇帖子吗？此操作不可撤销。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          deleteUserPost(post.postId)
            .then(response => {
              if (response.error_msg === 'success') {
                ElMessage({
                  type: 'success',
                  message: '删除成功'
                });
                // 重新加载当前页的帖子
                viewUserPosts(selectedUser.value, postsCurrentPage.value);
              } else {
                ElMessage({
                  type: 'error',
                  message: response.error_msg || '删除失败'
                });
              }
            })
            .catch(error => {
              console.error('删除帖子失败:', error);
              ElMessage({
                type: 'error',
                message: error.message || '删除失败'
              });
            });
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '删除已取消'
          });
        });
    };

    // 简单的监听器
    watch(
      () => filters.value.showBanned,
      () => {
        loadUsers();
      }
    );

    watch(users, (newUsers) => {
      console.log('用户列表更新:', newUsers);
    }, { deep: true });

    watch(() => filters.value.showBanned, (newValue) => {
      console.log('显示已封禁用户过滤器变化:', newValue);
    });

    return {
      users,
      loading,
      error,
      errorMessage,
      searchQuery,
      filters,
      currentPage,
      totalPages,
      displayedPages,
      filteredUsers,
      selectedUser,
      newPassword,
      confirmPassword,
      passwordError,
      userPosts,
      loadingPosts,
      postsError,
      postsErrorMessage,
      handleSearch,
      changePage,
      toggleUserBan,
      handleBanConfirmation,
      showResetPasswordModal,
      resetPassword,
      viewUserPosts,
      formatDate,
      truncateContent,
      postsCurrentPage,
      postsTotalPages,
      postsPageSize,
      postsTotalItems,
      postsDisplayedPages,
      changePostsPage,
      showDeleteConfirmModal,
      confirmDeletePost,
      postToDelete,
      deletePost
    };
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 1.5rem;
}

.admin-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
  position: relative;
  display: block;
  padding-bottom: 0.5rem;
}

.admin-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 50%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #6a9eda, transparent);
  border-radius: 3px;
  transform: translateX(-50%);
}

.search-filter-section {
  margin-bottom: 1.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.pagination-container {
  margin-top: 1.5rem;
}

.table {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table thead {
  background-color: #f8f9fa;
}

.btn-group .btn {
  margin-right: 1rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
</style>
