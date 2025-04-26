import $ from "jquery";
import router from "@/router";
import { API_ENDPOINTS } from "@/config/api";

export default {
  state: {
    id: "",
    username: "",
    photo: "",
    token: "",
    role: "",
    is_login: false,
    status: "",  // 1 表示没有被封禁，0表示被封禁
    vip: 0,
    email:"",
  },
  getters: {
  },
  mutations: {
    updateUser(state, user) {
      state.id = user.id;
      state.username = user.username;
      state.photo = user.photo;
      state.role = user.role;
      state.is_login = user.is_login;
      state.status = user.status
      state.vip = user.vip,
      state.email = user.email

    },
    updateToken(state, token) {
      state.token = token;
    },
    logout(state){
      state.id = "";
      state.username = "";
      state.token = "";
      state.photo = "";
      state.role = "";
      state.is_login = false;
      state.status = "";
      state.vip = 0;
      state.email = "";
    }
  },
  actions: {  // 修改state的函数写在actions里边
    login(context, data) {
      $.ajax({
        url: API_ENDPOINTS.USER.LOGIN,
        type: "post",
        data: {
          username: data.username,
          password: data.password,
        },
        success(resp) {
          if (resp.error_msg === "success") {
            localStorage.setItem("jwt_token",resp.token);
            // 在这里调用mutations里的函数需要用commit加字符串的形式
            context.commit("updateToken", resp.token);
            data.success(resp)
          } else {
            data.error(resp)
          }
        },
        error(xhr) {
          // 捕获HTTP错误，如403等
          data.error({
            error_msg: "error",
            message: xhr.status === 403 ? "用户名或密码错误" : "登录失败，请稍后重试"
          });
        }
      });
    },
    logout(context){
      localStorage.removeItem("jwt_token");
      context.commit("logout");
      router.push({name:'home'});
    },

    getinfo(context, data) {
      $.ajax({
        url: API_ENDPOINTS.USER.INFO,
        type: "get",
        headers: {
          Authorization: "Bearer " + context.state.token,
        },
        success(resp) {
          if (resp.error_msg === "success") {
            context.commit("updateUser", {
              ...resp,
              is_login: true,
            });
            data.success(resp);
          } else {
            data.error(resp);
          }
        },
        error(resp) {
          data.error(resp)
        }
      })
    }
  },
  modules: {
  }
}