<template>
  <div class="container">
    <canvas ref="canvas" class="canvas"></canvas>
    <div class="content">
      <h1 class="error-code">404</h1>
      <p class="error-message">Oops! Page Not Found</p>
      <button class="back-btn" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';

const canvas = ref(null);
let ctx = null;
let particles = [];
let animationFrameId = null;

// 粒子配置
const config = {
  count: 200,
  maxRadius: 5,
  minRadius: 2,
  speedRange: { min: 0.5, max: 1.5 },
  colors: ['#4a90e2', '#f5a623', '#7ed321', '#db2828', '#9013fe']
};

// 初始化粒子
function initParticles() {
  particles = Array.from({ length: config.count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * (config.maxRadius - config.minRadius) + config.minRadius,
    speedX: (Math.random() - 0.5) * config.speedRange.max,
    speedY: (Math.random() - 0.5) * config.speedRange.max,
    color: config.colors[Math.floor(Math.random() * config.colors.length)]
  }));
}

// 绘制粒子
function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    
    // 更新位置
    p.x += p.speedX;
    p.y += p.speedY;
    
    // 边界检测
    if (p.x < 0 || p.x > window.innerWidth) p.speedX *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.speedY *= -1;
  });
}

// 动画循环
function animate() {
  drawParticles();
  animationFrameId = requestAnimationFrame(animate);
}

// 窗口调整处理
function handleResize() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    initParticles();
  }
}

// 生命周期
onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    handleResize();
    initParticles();
    animate();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

// 监听窗口变化
watchEffect(() => {
  handleResize();
});

// 返回首页
function goHome() {
  window.location.href = '/';
}
</script>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
  background-color: #1a1a1a;
  overflow: hidden;
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.error-code {
  font-family: 'Arial Black', sans-serif;
  font-size: 15vw;
  margin: 0;
  opacity: 0.9;
  background: linear-gradient(45deg, #4a90e2, #f5a623);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: slideIn 1s ease-out;
}

.error-message {
  font-size: 2vw;
  margin: 20px 0;
  opacity: 0.8;
  animation: fadeIn 1s ease-out;
}

.back-btn {
  padding: 15px 30px;
  font-size: 1.2vw;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  animation: bounceIn 1s ease-out;
}

.back-btn:hover {
  background: #2b65d9;
  transform: translateY(-2px);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 20vw;
  }
  .error-message {
    font-size: 4vw;
  }
  .back-btn {
    font-size: 4vw;
    padding: 10px 20px;
  }
}
</style>