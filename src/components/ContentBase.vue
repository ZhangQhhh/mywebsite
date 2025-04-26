<template>
  <div class="container">
    <div class="home">
        <div class="card" >
            <div class="card-body">
              <slot> </slot>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default{
    name: 'ContentBase',
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.content-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .content-wrapper {
    padding: 1.5rem;
  }
}
</style>