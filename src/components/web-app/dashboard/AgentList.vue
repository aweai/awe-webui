<script setup>
import userAgentAPI from '@/api/v1/user-agent'
import { onMounted, ref, watch } from 'vue'
import CreateAgent from './CreateAgent.vue';
import TgCopyButton from './TgCopyButton.vue';
import { useWalletStore } from '@/stores/wallet';
import { storeToRefs } from 'pinia';
import router from '@/router';
import Pfp from '../ThePfp.vue';

const walletStore = useWalletStore()
const loading = ref(true)
const userAgents = ref([])
const importing = ref(false)

const loadAgentList = async () => {
    userAgents.value = await userAgentAPI.getUserAgents()
}

const refreshAgentList = async () => {

    if (importing.value)
        return

    importing.value = true

    try {
        userAgents.value = await userAgentAPI.importUserAgents()
    } catch (e) {
        console.error(e)
    } finally {
        importing.value = false
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    })
}

const { agentCreationQuote } = storeToRefs(walletStore)

watch(agentCreationQuote, async (newQuote) => {
    if (newQuote > userAgents.value.length) {
        await refreshAgentList()
    }
});

onMounted(async () => {
    try {
        await loadAgentList()
    } catch (e) {
        console.log(e)
    } finally {
        loading.value = false
    }
});

const goToDetail = (agentId) => {
    router.push({ 'name': 'agent', 'params': { 'agent_id': agentId } })
};

</script>

<template>
    <div class="page-title">
        Memegents ({{ walletStore.agentCreationQuote }})
        <div :class="{ 'reload-btn': true, 'loading': importing }" @click="refreshAgentList">
            <i class="not-loading fa-solid fa-rotate-right"></i>
            <div class="loading spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
    <div class="page-content">
        <div v-if="loading">Loading...</div>
        <div v-else>
            <div class="memegent-list">
                <div v-if="userAgents.length === 0" class="memegent-item row active fake">
                    <div class="mask"></div>
                    <div class="fake-text-container">
                        <div class="fake-text">Example</div>
                    </div>
                    <div class="col col-3">
                        <div class="memegent-card">
                            <div class="memegent-card-bg"></div>
                            <div class="memegent-card-content">
                                <div class="pfp">
                                    <img src="@/assets/images/pfp-placeholder-256.png" />
                                </div>
                                <div class="name">Memegent</div>
                                <div class="status">
                                    <div class="enabled">
                                        <i class="fa-solid fa-dove"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col col-9">
                        <div class="row">
                            <div class="col col-7">
                                <div class="row">
                                    <div class="col">
                                        <div class="telegram-link">
                                            <div class="telegram-link-bg"></div>
                                            <div class="telegram-link-content">
                                                <div class="tg-logo">
                                                    <i class="fa-brands fa-telegram"></i>
                                                </div>
                                                <div class="tg-link-content">
                                                    https://t.me/memegent_bot
                                                </div>
                                                <div class="copy">
                                                    <i class="fa-solid fa-copy"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col col-6">
                                        <div class="stats-item">
                                            <div class="stats-name">Users</div>
                                            <div class="stats-value">1,325</div>
                                        </div>
                                        <div class="stats-item">
                                            <div class="stats-name">Round Transferred</div>
                                            <div class="stats-value">20,375</div>
                                        </div>
                                    </div>
                                    <div class="col col-6">
                                        <div class="stats-item">
                                            <div class="stats-name">Invocations</div>
                                            <div class="stats-value">63K</div>
                                        </div>
                                        <div class="stats-item">
                                            <div class="stats-name">Pool</div>
                                            <div class="stats-value">243,656</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col col-5">
                                <div class="emissions">
                                    <div class="emissions-title">Emissions</div>
                                    <div class="awe-logo">
                                        <img src="@/assets/images/awe-logo-round.png" />
                                    </div>
                                    <div class="emissions-num">3,677,233</div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col edit-btn-area">
                                <a class="btn btn-primary edit-memegent-btn" href="javascript:void(0)"
                                    @click="goToDetail(agent.id)"><span>Details</span></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="{ 'memegent-item': true, 'row': true, 'active': agent.enabled }"
                    v-for="agent in userAgents" v-bind:key="agent.id">
                    <div class="col col-3">
                        <div class="memegent-card">
                            <div class="memegent-card-bg"></div>
                            <div class="memegent-card-content">
                                <pfp :agent-id="agent.id"></pfp>
                                <div class="name">{{ agent.name }}</div>
                                <div class="status">
                                    <div class="enabled" v-if="agent.enabled">
                                        <i class="fa-solid fa-dove"></i>
                                    </div>
                                    <div class="disabled" v-else>
                                        <i class="fa-solid fa-crow"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col col-9">
                        <div class="row">
                            <div class="col col-7">
                                <div class="row">
                                    <div class="col">
                                        <div class="telegram-link">
                                            <div class="telegram-link-bg"></div>
                                            <div class="telegram-link-content">
                                                <div class="tg-logo">
                                                    <i class="fa-brands fa-telegram"></i>
                                                </div>
                                                <div class="tg-link-content">
                                                    <span v-if="agent.tg_bot">https://t.me/{{ agent.tg_bot.username
                                                        }}</span>
                                                    <span v-else>N/A</span>
                                                </div>
                                                <tg-copy-button v-if="agent.tg_bot"
                                                    :tg-username="agent.tg_bot.username"></tg-copy-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col col-6">
                                        <div class="stats-item">
                                            <div class="stats-name">Users</div>
                                            <div class="stats-value" v-if="agent.agent_data">{{
                                                agent.agent_data.total_users.toLocaleString() }}</div>
                                            <div class="stats-value" v-else>-</div>
                                        </div>
                                        <div class="stats-item">
                                            <div class="stats-name">Staking Pool</div>
                                            <div class="stats-value" v-if="agent.agent_data">{{
                                                agent.agent_data.awe_token_staking.toLocaleString() }}</div>
                                            <div class="stats-value" v-else>-</div>
                                        </div>
                                    </div>
                                    <div class="col col-6">
                                        <div class="stats-item">
                                            <div class="stats-name">Invocations</div>
                                            <div class="stats-value" v-if="agent.agent_data">{{
                                                agent.agent_data.total_invocations.toLocaleString() }}</div>
                                            <div class="stats-value" v-else>-</div>
                                        </div>
                                        <div class="stats-item">
                                            <div class="stats-name">Game Pool</div>
                                            <div class="stats-value" v-if="agent.agent_data">{{
                                                agent.agent_data.awe_token_quote.toLocaleString() }}</div>
                                            <div class="stats-value" v-else>-</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col col-5">
                                <div class="emissions">
                                    <div class="emissions-title">Emissions</div>
                                    <div class="awe-logo">
                                        <img src="@/assets/images/awe-logo-round.png" />
                                    </div>
                                    <div class="emissions-num">{{  agent.agent_data.total_emissions.toLocaleString()  }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col edit-btn-area">
                                <a class="btn btn-primary edit-memegent-btn" href="javascript:void(0)"
                                    @click="goToDetail(agent.id)"><span>Details</span></a>
                            </div>
                        </div>
                    </div>
                    <div class="memegent-id"># {{ agent.id }}</div>
                </div>
            </div>
            <create-agent></create-agent>
        </div>
    </div>
</template>
<style>
.reload-btn {
    position: absolute;
    right: 0;
    top: 4px;
    cursor: pointer;
}

.reload-btn:hover {
    color: rgba(69, 248, 130, 0.66);
}

.reload-btn .loading {
    position: relative;
    top: 20px;
}

.reload-btn .loading,
.reload-btn.loading .not-loading {
    display: none;
}

.reload-btn.loading .loading {
    display: block;
}

.memegent-item {
    position: relative;
    margin-bottom: 32px;
    background-image: url(/src/assets/images/social_bg.png);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    padding: 24px 32px;
    min-height: 320px;
}

.memegent-item.fake {
    opacity: 0.6;
}

.memegent-item.fake .mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 8px;
    bottom: 18px;
    background-color: white;
    opacity: 0.3;
    z-index: 999998;
}

.memegent-item.fake .fake-text-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 8px;
    bottom: 16px;
    z-index: 999999;
}

.memegent-item.fake .fake-text-container .fake-text {
    font-size: 64px;
    text-align: center;
    line-height: 260px;
    font-family: 'Berlin Sans FB Demi';
    color: rgba(69, 248, 130);
}

.memegent-item .memegent-id {
    position: absolute;
    width: 200px;
    height: 40px;
    right: 0;
    bottom: 12px;
    text-align: right;
    font-size: 18px;
    color: #555;
}

.memegent-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
}

.memegent-card .memegent-card-bg {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #333;
    opacity: 0.3;
}

.memegent-item.active .memegent-card-bg {
    border: 2px solid rgba(69, 248, 130);
}

.memegent-card .memegent-card-content {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
}

.memegent-card .memegent-card-content .pfp {
    position: relative;
    width: 80%;
    margin: 12px auto;
}

.memegent-card .memegent-card-content .name {
    font-family: 'Berlin Sans FB Demi';
    font-size: 20px;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.memegent-card .memegent-card-content .status {
    text-align: center;
    font-size: 20px;
    margin-top: 16px;
}

.memegent-card .memegent-card-content .status .enabled {
    color: rgba(69, 248, 130);
}

.memegent-card .memegent-card-content .status .disabled {
    color: #555;
}

.telegram-link {
    position: relative;
    height: 36px;
}

.telegram-link .telegram-link-bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #222;
    border: 1px solid #121212;
    border-radius: 3px;
    opacity: 0.4;
}

.telegram-link .telegram-link-content {
    position: relative;
    height: 100%;
}

.telegram-link .telegram-link-content .tg-logo {
    position: absolute;
    left: 0;
    top: 0;
    width: 36px;
    height: 36px;
    font-size: 22px;
    line-height: 36px;
    text-align: center;
}

.telegram-link .telegram-link-content .tg-link-content {
    position: relative;
    height: 36px;
    margin: 0 36px;
    padding-left: 10px;
    font-size: 16px;
    line-height: 36px;
    background-color: #111;
    opacity: 0.5;
}

.stats-item {
    margin-top: 10px;
    margin-left: 16px;
    font-family: 'Berlin Sans FB';
}

.stats-item .stats-name {
    font-size: 16px;
}

.stats-item .stats-value {
    color: white;
    font-size: 30px;
}

.emissions {
    position: relative;
    font-family: 'Berlin Sans FB Demi';
    text-align: center;
}

.emissions .emissions-title {
    font-size: 30px;
    margin-top: 24px;
}

.emissions .awe-logo {
    position: relative;
    width: 30%;
    margin: 0 auto;
    margin-top: 12px;
}

.emissions .emissions-num {
    font-size: 40px;
    line-height: 40px;
    color: white;
    text-shadow: -1px 3px 0px rgba(69, 248, 130, 0.66);
}

.edit-btn-area,
.memegent-item.fake:hover .edit-btn-area {
    position: relative;
    display: none;
    width: 100%;
    height: 50px;
}

.memegent-item:hover .edit-btn-area {
    display: block;
}

.btn.btn-primary.edit-memegent-btn {
    position: absolute;
    left: 230px;
    bottom: -16px;
    padding: 14px 8px;
    min-width: 160px;
}
</style>
