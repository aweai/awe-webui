<script setup>
import { ref } from 'vue'
import userAgentAPI from '@/api/v1/user-agent'

import { useRouter } from 'vue-router'
const router = useRouter()
const currentRoute = router.currentRoute.value

import { useAgentStore } from '@/stores/agent'

import { alert } from "@/messages"

import ChargeGamePool from './ChargeGamePool.vue'

const agentStore = useAgentStore()

const agentData = agentStore.currentAgent
const agentStatsData = agentStore.currentAgentStats

const gamePoolSectionOpen = ref(false)
const paymentSectionOpen = ref(false)

const resetting = ref(false)

const resetRound = async () => {

    if (resetting.value) {
        return
    }

    resetting.value = true

    try {
        await userAgentAPI.resetAgentRound(currentRoute.params.agent_id)
    } catch (e) {
        console.error(e)
        alert("Error resetting round data. Please try again later", "danger", 5000)
        resetting.value = false
        return
    }

    try {
        await agentStore.loadAgentStats(currentRoute.params.agent_id)
    } catch (e) {
        console.error(e)
        alert("Error refreshing Memegent data. Please try again later", "danger", 5000)
    } finally {
        resetting.value = false
    }

}
</script>
<template>
    <section :class="{ 'config-section': true, 'token-distribution': true, 'open': paymentSectionOpen }">
        <h3 class="section-title" @click="paymentSectionOpen = !paymentSectionOpen">
            <div
                :class="{ 'section-completed': true, 'yes': agentStore.paymentReady, 'no': !agentStore.paymentReady }">
                <div class="yes">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="no">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
            </div>
            <div class="text">Play Fee</div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="section-body">

            <blockquote class="blockquote">
                <p>
                    Set the play fee in $AWE that players must pay before interacting with your Memegent. You can decide how the fee is split between yourself, as the creator, and the game pool. Additionally, specify the maximum number of messages a player can send per play session.
                </p>
            </blockquote>

            <div class="mb-3 config-item">
                <label for="user-payment-per-round" class="form-label">Play Fee (at least 10 $AWE)</label>
                <input v-model.number="agentData.awe_agent.awe_token_config.user_price" type="number" step="1"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': !Number.isInteger(agentData.awe_agent.awe_token_config.user_price) || agentData.awe_agent.awe_token_config.user_price < 10 }"
                    id="user-payment-per-round">
            </div>
            <div class="mb-3 config-item">
                <label for="max_invocation_per_payment" class="form-label">Play Fee Distribution Settings</label>
                <div class="row slider-item">
                    <div class="col col-3 text-end">
                        Creator: <span class="division-num">{{ 100 - agentData.awe_agent.awe_token_config.game_pool_division }}</span>%
                    </div>
                    <div class="col col-6 slider">
                        <input type="range" class="form-range" min="0" max="100" step="1" v-model.number="agentData.awe_agent.awe_token_config.game_pool_division">
                    </div>
                    <div class="col col-3">
                        Game Pool: <span class="division-num">{{ agentData.awe_agent.awe_token_config.game_pool_division }}</span>%
                    </div>
                </div>
            </div>
            <div class="mb-3 config-item">
                <label for="max_invocation_per_payment" class="form-label">Max player messages per play (0 means no limit)</label>
                <input v-model.number="agentData.awe_agent.awe_token_config.max_invocation_per_payment" type="number" step="1"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': !Number.isInteger(agentData.awe_agent.awe_token_config.max_invocation_per_payment) || agentData.awe_agent.awe_token_config.max_invocation_per_payment < 0 }"
                    id="max_invocation_per_payment">
            </div>
            <div class="mb-3">
                <label for="max_payment_per_round" class="form-label">Max play per round (0 means no limit)</label>
                <input v-model.number="agentData.awe_agent.awe_token_config.max_payment_per_round" type="number" step="1"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': !Number.isInteger(agentData.awe_agent.awe_token_config.max_payment_per_round) || agentData.awe_agent.awe_token_config.max_payment_per_round < 0 }"
                    id="max_payment_per_round">
            </div>
        </div>
    </section>
    <section :class="{ 'config-section': true, 'token-distribution': true, 'open': gamePoolSectionOpen }">

        <h3 class="section-title" @click="gamePoolSectionOpen = !gamePoolSectionOpen">
            <div
                :class="{ 'section-completed': true, 'yes': agentStore.gamePoolReady, 'no': !agentStore.gamePoolReady}">
                <div class="yes">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="no">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
            </div>
            <div class="text">Game Pool</div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="token-progress-overview" v-if="agentData.awe_agent.awe_token_enabled && !gamePoolSectionOpen">
            <div class="progress" role="progressbar" aria-label="AWE used this round"
                :aria-valuenow="agentStatsData.awe_token_round_transferred" aria-valuemin="0"
                :aria-valuemax="agentStore.maxQuoteThisRound" style="height: 24px">
                <div :class="{
                    'progress-bar': true,
                    'progress-bar-striped': true,
                    'progress-bar-animated': true,
                    'bg-info': agentStore.roundUsedPercentage < 100,
                    'bg-danger': agentStore.roundUsedPercentage === 100,
                    'overflow-visible': true
                }" :style="{ width: agentStore.roundUsedPercentage + '%' }">
                    <span style="display:inline-block;padding-left:6px;">
                        {{ agentStatsData.awe_token_round_transferred }}.00
                        /
                        {{ agentStore.maxQuoteThisRound }}.00 AWE
                    </span>
                </div>
            </div>
        </div>

        <div class="section-body">

            <blockquote class="blockquote">
                <p>
                    Players can connect their Solana wallets directly on Telegram to participate in games and earn $AWE from the game pool by winning matches or successfully jailbreaking a Memegent.
                    Creators can configure a maximum $AWE reward per round and have the flexibility to start a new round once reaching the limit. To ensure seamless gameplay, Memegents must be preloaded with a sufficient balance of $AWE tokens to stay active and ready for challenges.
                </p>
            </blockquote>
            <div class="mb-3 round">
                <label class="form-label">Round number</label>
                <div class="row">
                    <div class="col col-9 round-number">
                        Round {{ agentStatsData.current_round }}
                    </div>
                    <div class="col col-3 actions">
                        <button v-if="!resetting" type="button" class="btn btn-secondary" data-bs-toggle="modal"
                            data-bs-target="#confirmReset">New Round</button>

                        <div v-if="resetting" class="spinner-border" role="status"
                            style="margin-top: 8px;margin-right: 16px;">
                            <span class="visually-hidden">Updating...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">$AWE out this round</label>
                <div class="row">
                    <div class="col col-12">
                        <div class="progress" role="progressbar" aria-label="AWE used this round"
                            :aria-valuenow="agentStatsData.awe_token_round_transferred" aria-valuemin="0"
                            :aria-valuemax="agentStore.maxQuoteThisRound" style="height: 48px">
                            <div :class="{
                                'progress-bar': true,
                                'progress-bar-striped': true,
                                'progress-bar-animated': true,
                                'bg-info': agentStore.roundUsedPercentage < 100,
                                'bg-danger': agentStore.roundUsedPercentage === 100,
                                'overflow-visible': true
                            }" :style="{ width: agentStore.roundUsedPercentage + '%' }">
                                <span style="display:inline-block;padding-left:6px;">
                                    {{ agentStatsData.awe_token_round_transferred }}.00
                                    /
                                    {{ agentStore.maxQuoteThisRound }}.00 AWE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3 token-left">
                <div class="row">
                    <div class="col col-9">
                        <label class="form-label">Game pool:</label>
                        <span class="value"><span
                                :class="{ 'num': true, 'zero': agentStatsData.awe_token_quote === 0 }">{{
                                    agentStatsData.awe_token_quote }}.00</span> AWE</span>
                    </div>
                    <div class="col col-3 actions">
                        <charge-game-pool></charge-game-pool>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label for="max-per-tx" class="form-label">Max reward per play</label>
                <input v-model.number="agentData.awe_agent.awe_token_config.max_token_per_tx" type="number" step="1"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': !Number.isInteger(agentData.awe_agent.awe_token_config.max_token_per_tx) || agentData.awe_agent.awe_token_config.max_token_per_tx <= 0 }"
                    id="max-per-tx">
            </div>

            <div class="mb-3">
                <label for="max-per-round" class="form-label">Max reward per round</label>
                <input v-model.number="agentData.awe_agent.awe_token_config.max_token_per_round" type="number" step="1"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': !Number.isInteger(agentData.awe_agent.awe_token_config.max_token_per_round) || agentData.awe_agent.awe_token_config.max_token_per_round <= 0 }"
                    id="max-per-round">
            </div>
        </div>
    </section>
    <div class="awe-modal modal fade" id="confirmReset" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="resetRound" data-bs-theme="light">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetRound">Start a New Round</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row confirm-message justify-content-center">
                        <div class="col col-10">
                            <ul>
                                <li>• $AWE reward limit will be reset.</li>
                                <li>• Players will have to pay again to participate.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-secondary" @click="resetRound"
                        data-bs-dismiss="modal"><span>Start</span></button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.config-item {
    margin-top: 36px;
}
.slider-item .slider {
    margin-top: 22px;
}
.division-num {
    font-size: 36px;
    color: rgba(69, 248, 130);
    margin-left: 10px;
}

.token-distribution .actions {
    padding-top: 12px;
    text-align: right;
    padding-right: 24px;
}

.token-distribution .token-left .num {
    font-size: 40px;
    margin-left: 24px;
    color: rgba(69, 248, 130);
}

.round .round-number {
    font-size: 40px;
    color: rgba(69, 248, 130);
}

.token-distribution .token-left .num.zero {
    color: #dc3545
}
</style>
