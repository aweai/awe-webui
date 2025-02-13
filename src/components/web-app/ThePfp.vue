<script setup>
import { onMounted, ref } from 'vue'
import { alert } from "@/messages"
import userAgentAPI from '@/api/v1/user-agent'

const props = defineProps(['agentId', 'forceReload'])

const pfpBase64 = ref("")

const forceReload = props.forceReload == true

const loadPFP = async () => {
    pfpBase64.value = await userAgentAPI.getPFP(props.agentId, forceReload)
}

onMounted(async () => {
    try {
        await loadPFP()
    } catch (e) {
        console.error(e)
        alert("Failed loading PFP. Please try again later...", "danger", 5000)
    }
})

</script>
<template>
<div class="pfp">
    <img v-if="pfpBase64 === ''" src="@/assets/images/pfp-placeholder-256.png" />
    <img class="real" v-if="pfpBase64 !== ''" :src="pfpBase64"/>
</div>
</template>
<style scoped>
.pfp {
    position: relative;
    width: 132px;
    height: 132px;
    margin: 12px auto;
}

.pfp .real {
    position: relative;
    display: block;
    width: 132px;
    height: 132px;
    border-radius: 66px;
    overflow: hidden;
}
</style>
