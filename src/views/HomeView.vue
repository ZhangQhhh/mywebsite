<template>
  <Content>
    <!-- 艺术感欢迎区域 -->
    <div class="hero-section">
      <div class="hero-content">
      <h1>研究星球</h1>
        <div class="tagline">学术探索的艺术</div>
        <div class="hero-actions">
          <router-link :to="{name: 'userlist'}" class="action-btn primary">探索社区</router-link>
          <router-link :to="{name: 'userprofile'}" class="action-btn secondary">发现研究</router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 精华内容卡片 -->
    <div class="featured-section">
      <div class="row">
        <div class="col-md-4 mb-4" v-for="(card, index) in featuredCards" :key="index">
          <div class="featured-card">
            <div class="card-icon">
              <div class="icon-bg" :class="`bg-${index + 1}`"></div>
            </div>
            <h3>{{ card.title }}</h3>
            <router-link :to="card.link" class="card-link">
              <span class="link-text">探索</span>
              <span class="link-arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能展示区 -->
    <div class="services-section">
      <div class="row">
        <div class="col-md-4 mb-4" v-for="(feature, index) in features" :key="index">
          <div class="service-item">
            <div class="service-icon">{{ feature.icon }}</div>
            <h4>{{ feature.title }}</h4>
            <router-link :to="feature.link" class="service-link">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="elegant-footer">
      <div class="footer-logo">RS</div>
      <p>© 2025 研究星球</p>
    </div>
  </Content>
</template>

<script>
// @ is an alias to /src
import Content from '../components/ContentBase';
export default {
  name:"HomeView",
  components:{
    Content: Content,
  },

  data() {
    return {
      featuredCards: [
        {
          title: '研究成果',
          link: {name: 'userprofile'}
        },
        {
          title: '学术社区',
          link: {name: 'userlist'}
        },
        {
          title: '合作机会',
          link: {name: 'userprofile'}
        }
      ],
      features: [
        {
          icon: '👥',
          title: '好友互动',
          link: {name: 'userlist'}
        },
        {
          icon: '📝',
          title: '发布动态',
          link: {name: 'userprofile'}
        },
        {
          icon: '✏️',
          title: '在线编辑',
          link: {name: 'mark'}
        }
      ]
    };
  }
}
</script>

<style scoped>
/* 整体布局 */
.container {
  margin: 0 auto;
  padding: 0;
}

/* 英雄区域样式 */
.hero-section {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 6rem;
  padding: 0 3rem;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 650px;
}

.hero-content h1 {
  font-size: 4.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #2c3e50, #4a6fa5, #6a9eda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.tagline {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  color: #6c757d;
  letter-spacing: 2px;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
}

.action-btn {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6a9eda, #4a6fa5);
  color: white;
  box-shadow: 0 4px 15px rgba(106, 158, 218, 0.4);
}

.action-btn.secondary {
  background: transparent;
  color: #4a6fa5;
  border: 1px solid #4a6fa5;
}

.action-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(106, 158, 218, 0.5);
}

.action-btn.secondary:hover {
  background: rgba(74, 111, 165, 0.1);
}

.hero-visual {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.7;
}

.shape-1 {
  top: 20%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #6a9eda22, #6a9eda55);
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  top: 50%;
  right: 25%;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #4a6fa522, #4a6fa555);
  animation: float 12s ease-in-out infinite;
}

.shape-3 {
  bottom: 15%;
  right: 15%;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #2c3e5022, #2c3e5055);
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* 精华内容卡片 */
.featured-section {
  padding: 2rem 3rem;
  margin-bottom: 6rem;
}

.featured-card {
  height: 300px;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.featured-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.card-icon {
  margin-bottom: 2rem;
  position: relative;
  width: 70px;
  height: 70px;
}

.icon-bg {
  width: 100%;
  height: 100%;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  position: absolute;
}

.bg-1 { background: linear-gradient(135deg, #f8d5e3, #f3a2e5); }
.bg-2 { background: linear-gradient(135deg, #a1c4fd, #c2e9fb); }
.bg-3 { background: linear-gradient(135deg, #d4fc79, #96e6a1); }

.featured-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #2c3e50, #6a9eda);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-link {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: #6a9eda;
  padding-top: 1rem;
  font-weight: 500;
  border-top: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.link-arrow {
  transition: transform 0.3s ease;
}

.card-link:hover .link-arrow {
  transform: translateX(5px);
}

/* 服务功能区域 */
.services-section {
  padding: 2rem 3rem;
  margin-bottom: 6rem;
}

.service-item {
  height: 220px;
  background: linear-gradient(135deg, #f5f7fa, #e4e8ee);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.service-item:hover {
  background: linear-gradient(135deg, #e4e8ee, #f5f7fa);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.service-item h4 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.service-link {
  display: flex;
  gap: 5px;
  margin-top: auto;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6a9eda;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.service-link:hover .dot {
  opacity: 1;
  transform: scale(1.2);
}

/* 优雅页脚 */
.elegant-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  color: #6c757d;
  position: relative;
}

.footer-logo {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6a9eda, #2c3e50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

@media (max-width: 992px) {
  .hero-section {
    padding: 0 1.5rem;
    flex-direction: column;
    min-height: 70vh;
  }
  
  .hero-content h1 {
    font-size: 3.5rem;
  }
  
  .hero-visual {
    position: relative;
    width: 100%;
    height: 300px;
    margin-top: 2rem;
  }
  
  .featured-section, .services-section {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }
  
  .tagline {
    font-size: 1.2rem;
  }
  
  .action-btn {
    padding: 0.7rem 1.5rem;
  }
}
</style>
