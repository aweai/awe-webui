<script setup>
import { ref, onMounted } from "vue"
import userAgentAPI from "@/api/v1/user-agent"
const props = defineProps(['agent'])
const agent = props.agent

const pfpBase64 = ref("")
const bgImg = ref(null)

const loadPFP = async () => {
    pfpBase64.value = await userAgentAPI.getPFP(agent.id)
    if(pfpBase64.value !== "") {
        bgImg.value.style.backgroundImage = `url('${pfpBase64.value}')`
    }
}

onMounted(async () => {
    await loadPFP()
});
</script>
<template>
<a class="memegent-card" :href="'https://t.me/' + agent.tg_username" target="_blank">
    <div class="bg">
        <div class="img" ref="bgImg"></div>
    </div>
    <div class="content">
        <div class="pfp">
            <img v-if="pfpBase64 === ''" src="@/assets/images/pfp-placeholder-256.png" />
            <img v-if="pfpBase64 !== ''" :src="pfpBase64"/>
        </div>
        <div class="name">{{  agent.name  }}</div>
        <div class="description">{{  agent.description  }}</div>
    </div>
</a>
</template>
<style scoped>
.memegent-card {
    position: relative;
    display: block;
    margin-top: 8px;
    min-height: 260px;
    cursor: pointer;
}
.memegent-card:hover {
    width: 120%;
    left: -10%;
}
.memegent-card .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #1b242e;
    opacity: 0.7;
    border: 1px solid #1b242e;
    z-index: 1;
    overflow: hidden;
    transition: all 0.1s linear;
}
.memegent-card:hover .bg {
    border-color: rgb(69, 248, 130);
    opacity: 1;
    filter: drop-shadow(0 0 0.5em rgba(69, 248, 130, 0.5))
}
.memegent-card .bg .img {
    display: block;
    background-image: url('@/assets/images/pfp-placeholder-256.png');
    background-size: cover;
    background-position: center;
    min-width: 300%;
    min-height: 300%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    filter: blur(1.5em);
    opacity: 0.5;
    transition: all 0.5s linear;
}
.memegent-card:hover .bg .img {
    min-width: 400%;
    min-height: 400%;
}
.memegent-card .content {
    position: relative;
    z-index: 2;
    padding: 24px;
}
.memegent-card .content .pfp {
    width: 50%;
    margin: auto;
    border-radius: 50%;
    overflow: hidden;
}
.memegent-card:hover .content .pfp {
    width: 60%;
    transition: all 0.1s linear;
}
.memegent-card .content .name {
    text-align: center;
    margin-top: 12px;
    color: #fff;
    font-weight: 700;
}
.description {
    color: #ccd;
    line-height: 1.4;
    font-size: 16px;
    margin-top: 12px;
}
</style>
