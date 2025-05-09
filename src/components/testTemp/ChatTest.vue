<template>
    <div class="chat-test">
        <h1>WebSocket 聊天测试</h1>
        <ChatTestPanel />
    </div>
</template>

<script setup>
import ChatTestPanel from '@/components/testTemp/ChatTestPanel.vue';
</script>

<style scoped>
.chat-test {
    padding: 20px;
}
</style>