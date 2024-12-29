<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const agentId = route.params.agent_id
const tgUserId = route.params.tg_user_id
const timestamp = route.query.timestamp
const signature = route.query.signature
</script>
<template>
<div class="message-box">
    <div class="title">Bind your Solana wallet</div>
    <div class="message">
        <div class="text">Please sign the message in the wallet popup window</div>
        <div class="loading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</div>
</template>
<style scoped>
</style>
