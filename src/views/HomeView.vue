<template>
  <Content>
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <h1>研究星球</h1>
      <p>探索学术世界的新方式</p>
    </div>

    <!-- 内容卡片展示区 -->
    <div class="content-cards">
      <h2 class="section-title">最新动态</h2>
      <div class="row">
        <div class="col-md-4 mb-4" v-for="(card, index) in featuredCards" :key="index">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ card.title }}</h5>
              <p class="card-text">{{ card.description }}</p>
              <router-link :to="card.link" class="btn btn-primary">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能导航模块 -->
    <div class="features-section">
      <h2 class="section-title">探索功能</h2>
      <div class="row text-center">
        <div class="col-md-4 mb-4" v-for="(feature, index) in features" :key="index">
          <div class="feature-item">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
            <router-link :to="feature.link" class="btn btn-outline-primary">开始使用</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="home-footer">
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
          description: '探索最新学术突破与研究进展',
          link: {name: 'userprofile'}
        },
        {
          title: '学术社区',
          description: '连接志同道合的研究者',
          link: {name: 'userlist'}
        },
        {
          title: '合作机会',
          description: '发现跨学科合作与交流',
          link: {name: 'userprofile'}
        }
      ],
      features: [
        {
          icon: '👥',
          title: '好友互动',
          description: '连接学术伙伴',
          link: {name: 'userlist'}
        },
        {
          icon: '📝',
          title: '发布动态',
          description: '分享研究进展',
          link: {name: 'userprofile'}
        },
        {
          icon: '✏️',
          title: '在线编辑',
          description: '记录研究想法',
          link: {name: 'mark'}
        }
      ]
    };
  }
}
</script>

<style scoped>
.container{
  margin-top: 20px;
}

.welcome-banner {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 3rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-banner h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 600;
}

.welcome-banner p {
  color: #6c757d;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.content-cards, .features-section {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
  position: relative;
  display: block;
  padding-bottom: 0.5rem;
}

.section-title::after {
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

.feature-item {
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.home-footer {
  text-align: center;
  padding: 1rem 0;
  margin-top: 2rem;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
}

.card {
  background-color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.btn {
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
  z-index: -1;
}

.btn:hover::before {
  left: 0;
}

.btn-primary {
  background-color: #6a9eda;
  border-color: #6a9eda;
}

.btn-outline-primary {
  color: #6a9eda;
  border-color: #6a9eda;
}

.btn-outline-primary:hover {
  background-color: #6a9eda;
  color: white;
}
</style>
