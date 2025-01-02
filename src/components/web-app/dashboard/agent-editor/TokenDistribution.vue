<script setup>
import { ref, watch } from 'vue'
import userAgentAPI from '@/api/v1/user-agent'

import { useRouter } from 'vue-router'
const router = useRouter()
const currentRoute = router.currentRoute.value

import { useAgentStore } from '@/stores/agent'

import { alert } from "@/messages"

const agentStore = useAgentStore()

const agentData = agentStore.currentAgent
const agentStatsData = agentStore.currentAgentStats

const sectionOpen = ref(false)

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

watch(() => agentData.awe_agent.awe_token_enabled, (enabled) => {
    sectionOpen.value = enabled
});
</script>
<template>
    <section :class="{ 'config-section': true, 'token-distribution': true, 'open': sectionOpen }">

        <h3 class="section-title" @click="sectionOpen = !!(agentData.awe_agent.awe_token_enabled && !sectionOpen)">
            <div
                :class="{ 'section-completed': true, 'yes': agentData.awe_agent.awe_token_enabled && agentStore.tokenReady, 'no': !agentStore.tokenReady || !agentData.awe_agent.awe_token_enabled }">
                <div class="yes">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="no">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
            </div>
            <div class="text">Token Distribution</div>
            <div class="section-enabler">
                <div class="form-check form-switch">
                    <input v-model="agentData.awe_agent.awe_token_enabled" class="form-check-input" type="checkbox"
                        role="switch">
                </div>
            </div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="token-progress-overview" v-if="agentData.awe_agent.awe_token_enabled && !sectionOpen">
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
                    Enable to allow Memegent send tokens to the users.
                    The users could bind their Solana wallets in Telegram,
                    when the Memegent decides to transfer some tokens, it will use the user's wallet automatically.
                    You can set the maximum amount allowed in a round, and restart the round when the maximum is
                    reached.
                    You must charge the Memegent with enough AWE before it could perform the transaction.
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
            <div class="mb-3 token-used">
                <label class="form-label">Token used this round</label>
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
                        <label class="form-label">Memegent pool:</label>
                        <span class="value"><span
                                :class="{ 'num': true, 'zero': agentStatsData.awe_token_quote === 0 }">{{
                                    agentStatsData.awe_token_quote }}.00</span> AWE</span>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label for="user-payment-per-round" class="form-label">User payment price (at least 10)</label>
                <input v-model="agentData.awe_agent.awe_token_config.user_price" type="number"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.user_price < 10 }"
                    id="user-payment-per-round">
            </div>

            <div class="mb-3">
                <label for="max-per-tx" class="form-label">Max transfer amount allowed per transaction</label>
                <input v-model="agentData.awe_agent.awe_token_config.max_token_per_tx" type="number"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_token_per_tx <= 0 }"
                    id="max-per-tx">
            </div>

            <div class="mb-3">
                <label for="max-per-round" class="form-label">Max transfer amount allowed per round</label>
                <input v-model="agentData.awe_agent.awe_token_config.max_token_per_round" type="number"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_token_per_round <= 0 }"
                    id="max-per-round">
            </div>

            <div class="mb-3">
                <label for="max_invocation_per_round" class="form-label">Max user invocation allowed per round</label>
                <input v-model="agentData.awe_agent.awe_token_config.max_invocation_per_round" type="number"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_invocation_per_round < 0 }"
                    id="max_invocation_per_round">
            </div>

            <div class="mb-3">
                <label for="max_invocation_per_payment" class="form-label">Max user invocation allowed per payment</label>
                <input v-model="agentData.awe_agent.awe_token_config.max_invocation_per_payment" type="number"
                    :class="{ 'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_invocation_per_payment < 0 }"
                    id="max_invocation_per_payment">
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
                                <li>• Token transfer limit for a round will be reset.</li>
                                <li>• Users will have to pay again to participate.</li>
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
.token-distribution .token-used .actions {
    text-align: right;
}

.token-distribution .token-left .actions {
    padding-top: 12px;
    text-align: right;
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
