<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import userAgentAPI from "@/api/v1/user-agent"
import { shortenNumber, shortenToken } from "@/utils"
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

const maxDescriptionAllowed = ref(100)

const windowResize = () => {
    maxDescriptionAllowed.value = getMaxDescriptionAllowed()
}

const getMaxDescriptionAllowed = () => {
    const rowLength = 25;
    if (window.innerWidth >= 1200) return 9 * rowLength;
    if (window.innerWidth >= 992) return 7 * rowLength;
    if (window.innerWidth >= 575) return 5 * rowLength;
    return 3 * rowLength;
}

const limitDescription = (v) => {
    if (v.length <= maxDescriptionAllowed.value) return v

    return v.substring(0, maxDescriptionAllowed.value) + "..."
};

onBeforeUnmount(() => {
    window.removeEventListener('resize', windowResize)
})

onMounted(async () => {
    window.addEventListener('resize', windowResize)
    await loadPFP()
    windowResize()
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
        <div class="description">{{  limitDescription(agent.description)  }}</div>
        <div class="game-pool">
            <span class="icon">
                <img src="@/assets/images/awe-token.png" />
            </span>
            <span class="value">{{ shortenToken(agent.pool) }}</span>
        </div>
        <div class="stats">
            <div class="stats-item">
                <div class="icon">
                    <i class="fa-solid fa-bolt-lightning"></i>
                </div>
                <div class="value">
                    {{ agent.score }}
                </div>
            </div>
            <div class="stats-item">
                <div class="icon">
                    <i class="fa-solid fa-comment"></i>
                </div>
                <div class="value">
                    {{ shortenNumber(agent.invocations) }}
                </div>
            </div>
            <div class="stats-item">
                <div class="icon">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <div class="value">
                    {{ shortenToken(agent.staking) }}
                </div>
            </div>
        </div>
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
    opacity: 1;
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
.memegent-card .content .description {
    color: #ccd;
    line-height: 1.4;
    font-size: 16px;
    margin-top: 12px;
    overflow: hidden;
}
.memegent-card .content .game-pool {
    position: relative;
    margin: 24px 0;
    text-align: center;
}

.memegent-card .content .game-pool .icon img {
    vertical-align: top;
    margin-top: 8px;
}

.memegent-card .content .game-pool .value {
    font-size: 20px;
    line-height: 48px;
    color: rgb(69, 248, 130);
    margin-left: 6px;
}

.memegent-card .content .stats {
    position: absolute;
    bottom: 0;
    left: 12px;
}
.memegent-card .content .stats .stats-item {
    position: relative;
    display: inline-block;
    margin-right: 12px;
    color: #ccd;
    font-size: 14px;
    line-height: 14px;
    opacity: 0.5;
}
.memegent-card:hover .content .stats .stats-item {
    opacity: 1;
}
.stats-item .icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 14px;
    height: 14px;
}
.stats-item .value {
    margin-left: 16px;
    margin-top: 2px;
}
@media screen and (min-width: 575.01px) and (max-width: 1200px) {
    .memegent-card .content {
        padding: 16px;
    }
    .memegent-card .content .game-pool {
        margin: 8px 0 16px;
    }
}
@media screen and (max-width: 575px) {
    .memegent-card .content {
        padding: 16px 6px;
    }
}
</style>
