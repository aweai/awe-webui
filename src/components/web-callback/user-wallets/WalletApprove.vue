<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const agentId = router.currentRoute.params.agent_id
const tgUserId = router.currentRoute.params.tg_user_id
const timestamp = router.currentRoute.query.timestamp
const signature = router.currentRoute.query.signature



</script>
<template>

</template>
<style scoped>

</style>
