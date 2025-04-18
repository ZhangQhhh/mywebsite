<template>
  <div class="footer-container">
    <div class="icp-info">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">豫ICP备2024102743号</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FooterICP'
}
</script>

<style scoped>
.footer-container {
  width: 100%;
  padding: 15px 0;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  /* background-color: rgba(255, 255, 255, 0.9); */
  z-index: 100;
}

.icp-info {
  font-size: 15px;
  /* color: #666; */
  color: #42b983;
}

.icp-info a {
  color: #42b983;
  text-decoration: none;
  transition: color 0.3s ease;
}

.icp-info a:hover {
  color: #42b983;
}
</style>