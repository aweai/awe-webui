<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router';
import StatsCharts from './StatsCharts.vue';
import TokenDistribution from './TokenDistribution.vue';
import ImageGeneration from './ImageGeneration.vue';
import PfpUpload from './PfpUpload.vue';
const router = useRouter()
const currentRoute = router.currentRoute.value
import { alert } from '@/messages'
import { useAgentStore } from '@/stores/agent';
import { storeToRefs } from 'pinia';

const agentStore = useAgentStore()

const loaded = ref(false)
const agentData = agentStore.currentAgent

const saving = ref(false)
const saved = ref(true)
const savedAnimating = ref(false)

let triggerTimestamp = 0;

const triggerSave = () => {
    triggerTimestamp = Date.now()
    waitSave(triggerTimestamp)
}

const waitSave = (timestamp) => {
    setTimeout(async () => {
        if (timestamp !== triggerTimestamp) return

        let err = null
        if (agentStore.currentAgent.enabled) {
            err = agentStore.validateForEnable()
        } else {
            err = agentStore.validateForSave()
        }

        if (err) {
            alert("Memegent not save! " + err, "danger", 5000)
            return
        }

        saving.value = true
        saved.value = true
        savedAnimating.value = false

        try {
            await agentStore.saveAgent()

            savedAnimating.value = true

            setTimeout(() => {
                saved.value = false
                setTimeout(() => {
                    savedAnimating.value = false
                    saved.value = true
                }, 500);
            }, 500)

        } catch (e) {
            alert("Error while saving the Memegent. Please try again later.", "danger", 5000)
            console.error(e)
        } finally {
            saving.value = false
        }
    }, 1000)
}

const enableAgent = (event) => {

    if (agentStore.currentAgent.enabled) {
        // Disable agent
        agentStore.currentAgent.enabled = false
    } else {
        // Enable agent
        const err = agentStore.validateForEnable()
        if (err) {
            alert("Can not enable Memegent: " + err, "danger", 5000)
            event.preventDefault()
            return
        }

        agentStore.currentAgent.enabled = true
    }
};

const back = async () => {
    router.replace({ 'name': 'dashboard' })
}

const collapsingSections = reactive({
    "tg": false,
    "prompt": false
})

onMounted(async () => {
    try {
        await agentStore.loadAgent(currentRoute.params.agent_id)
        loaded.value = true

        const { currentAgent } = storeToRefs(agentStore)
        watch(
            currentAgent,
            () => {
                triggerSave()
            },
            { deep: true }
        )

    } catch (e) {
        alert("Error loading agent data. Please try again later.", "danger", 5000)
        console.log(e)
    }
})
</script>
<template>
    <div class="page-title">
        <div class="back-btn" @click="back">
            <i class="fa-solid fa-circle-chevron-left"></i>
        </div>
        <div class="memegent-name">
            {{ agentData.name !== "" && agentData.name || "New Memegent" }}
        </div>
    </div>

    <div v-if="loaded" data-bs-theme="dark">
        <form novalidate>
            <div class="row basic-info">
                <div class="col col-3">
                    <div class="memegent-head" :class="{ 'memegent-head': true, 'active': agentData.enabled }">
                        <div class="memegent-card-bg"></div>
                        <div class="memegent-card-content">
                            <pfp-upload :agent-id="currentRoute.params.agent_id"></pfp-upload>
                            <div class="name">
                                <input type="text"
                                    :class="{ 'form-control': true, 'is-invalid': agentData.name === '' }"
                                    v-model="agentData.name" />
                            </div>
                            <div class="status">
                                <div class="form-check form-switch">
                                    <input id="enableAgent" class="form-check-input" type="checkbox" role="switch"
                                        :checked="agentData.enabled" @click="enableAgent" />
                                    <label class="form-check-label" for="enableAgent">
                                        <div class="enabled" v-if="agentData.enabled">
                                            <span class="text">Alive</span>
                                            <i class="fa-solid fa-dove"></i>
                                        </div>
                                        <div class="disabled" v-else>
                                            <span class="text">Asleep</span>
                                            <i class="fa-solid fa-crow"></i>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col col-9">
                    <stats-charts :agent-id="currentRoute.params.agent_id"></stats-charts>
                </div>
            </div>

            <section :class="{ 'config-section': true, 'open': collapsingSections.tg }">
                <h3 class="section-title" @click="collapsingSections.tg = !collapsingSections.tg">
                    <div
                        :class="{ 'section-completed': true, 'yes': agentStore.tgBotReady, 'no': !agentStore.tgBotReady }">
                        <div class="yes">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div class="no">
                            <i class="fa-solid fa-circle-xmark"></i>
                        </div>
                    </div>
                    <div class="text">Telegram Bot</div>
                    <div class="collapse-toggle">
                        <i class="fa-solid fa-chevron-left"></i>
                    </div>
                </h3>
                <div class="section-body">
                    <blockquote class="blockquote">
                        <ul>
                            <li>1. Create the bot using the <a href="https://t.me/botfather"
                                    target="_blank">BotFather</a> in Telegram, and copy the username and token here.
                            </li>
                            <li>2. In a DM with BotFather, Menu -> Edit bot -> Choose your bot -> Bot settings -> Group
                                privacy -> Turn off.</li>
                        </ul>
                    </blockquote>

                    <div class="mb-3">
                        <label for="tg-username" class="form-label">Telegram username</label>
                        <input v-model="agentData.tg_bot.username" type="text"
                            :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.tg_bot.username === '' }"
                            id="tg-username" placeholder="Telegram username" />
                    </div>

                    <div class="mb-3">
                        <label for="tg-token" class="form-label">Token</label>
                        <input v-model="agentData.tg_bot.token" type="password"
                            :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.tg_bot.token === '' }"
                            id="tg-token" placeholder="Telegram token" />
                    </div>

                    <div class="mb-3">
                        <label for="welcome-message" class="form-label">Welcome message</label>
                        <textarea v-model="agentData.tg_bot.start_message"
                            :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.tg_bot.start_message === '' }"
                            id="welcome-message" rows="3"
                            placeholder="Message sent to user when the user clicks start"></textarea>
                    </div>
                </div>
            </section>
            <section :class="{ 'config-section': true, 'open': collapsingSections.prompt }">

                <h3 class="section-title" @click="collapsingSections.prompt = !collapsingSections.prompt">
                    <div
                        :class="{ 'section-completed': true, 'yes': agentStore.promptReady, 'no': !agentStore.promptReady }">
                        <div class="yes">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div class="no">
                            <i class="fa-solid fa-circle-xmark"></i>
                        </div>
                    </div>
                    <div class="text">Characteristics</div>
                    <div class="collapse-toggle">
                        <i class="fa-solid fa-chevron-left"></i>
                    </div>
                </h3>

                <div class="section-body">
                    <blockquote class="blockquote">
                        <p>
                            The main configuration of the Memegent. Describe the charateristics and behaviors of your
                            Memegent as detail as possible.
                            Give some examples of the conversation. An example config for the Pepegent <a
                                href="javascript:void(0)" target="_blank">can be found here</a>.
                        </p>
                    </blockquote>

                    <div class="mb-3">
                        <textarea v-model="agentData.awe_agent.llm_config.prompt_preset"
                            :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.llm_config.prompt_preset === '' }"
                            id="prompt-text" rows="15" placeholder="Characteristics of the Memegent"></textarea>
                    </div>
                </div>
            </section>

            <token-distribution></token-distribution>
            <image-generation></image-generation>
        </form>
    </div>
    <div v-if="saving" class="saving loading spinner-border text-light" role="status">
        <span class="visually-hidden">Saving...</span>
    </div>
    <div v-if="savedAnimating" :class="{ 'saved': saved, 'save-completed': true }">
        <i class="fa-solid fa-circle-check"></i>
    </div>
</template>
<style>
.page-title .back-btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
    cursor: pointer;
}

.page-title .back-btn:hover {
    color: rgba(69, 248, 130);
}

.page-title .memegent-name {
    margin-left: 58px;
}

.basic-info {
    margin-top: 48px;
}

.memegent-head {
    position: relative;
    width: 100%;
    height: 280px;
    border-radius: 4px;
    overflow: hidden;
}

.memegent-head .memegent-card-bg {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #1b242e;
}

.memegent-head.active .memegent-card-bg {
    border: 2px solid rgba(69, 248, 130);
}

.memegent-head .memegent-card-content {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
}

.memegent-head .memegent-card-content .status {
    font-size: 20px;
    margin-top: 16px;
    height: 36px;
    line-height: 36px;
}

.memegent-head .memegent-card-content .status .form-check {
    text-align: right;
}

.memegent-head .memegent-card-content .status .form-check .form-check-input {
    margin-top: 0.34em;
}

.memegent-head .memegent-card-content .status .enabled {
    color: rgba(69, 248, 130);
}

.memegent-head .memegent-card-content .status .disabled {
    color: #555;
}

.memegent-head .memegent-card-content .status .text {
    margin-right: 8px;
    font-family: 'Berlin Sans FB Demi';
    font-size: 16px;
    line-height: 36px;
    vertical-align: top;
}

.memegent-head .memegent-card-content .status svg {
    height: 20px;
    line-height: 36px;
}

.config-section {
    position: relative;
    display: block;
    background-color: #1b242e;
    box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.21);
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    -o-border-radius: 8px;
    -ms-border-radius: 8px;
    border-radius: 8px;
    padding: 24px 36px;
    margin-top: 24px;
}

.config-section .section-title {
    font-family: 'Berlin Sans FB Demi';
    cursor: pointer;
}

.config-section .section-title::after {
    content: "";
    display: none;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px 0px 0px;
}

.config-section.open .section-title::after {
    display: block;
}

.config-section .section-title .section-completed {
    position: absolute;
    width: 46px;
    height: 46px;
    text-align: center;
    line-height: 46px;
}

.config-section .section-title .section-completed .yes {
    color: rgba(69, 248, 130);
}

.config-section .section-title .section-completed .no {
    color: #666;
}

.config-section .section-title .section-completed.yes .no,
.config-section .section-title .section-completed.no .yes {
    display: none;
}

.config-section .section-title .text {
    margin-left: 50px;
    line-height: 46px;
}

.config-section .section-enabler {
    position: absolute;
    width: 46px;
    height: 46px;
    right: 96px;
    top: 24px;
}

.config-section .collapse-toggle {
    position: absolute;
    width: 46px;
    height: 46px;
    line-height: 46px;
    right: 36px;
    top: 24px;
    text-align: center;
    transition: all 0.1s linear;
}

.config-section .section-title:hover .collapse-toggle {
    color: rgba(69, 248, 130);
}

.config-section.open .collapse-toggle {
    transform: rotate(-90deg);
}

.config-section .section-body {
    height: 0;
    overflow: hidden;
}

.config-section.open .section-body {
    height: auto;
}

.section-body .blockquote {
    background-color: #2b343e;
    border: 1px solid #3b444e;
    padding: 16px;
    font-size: 14px;
    margin: 24px 0;
}

.saving {
    position: fixed;
    left: 12px;
    bottom: 12px;
    z-index: 999999;
}

.save-completed {
    position: fixed;
    left: 13px;
    bottom: 0;
    z-index: 999999;
    font-size: 30px;
    color: rgba(69, 248, 130);
    opacity: 0;
    transition: opacity .3s linear;
}

.save-completed.saved {
    opacity: 1;
}
</style>
