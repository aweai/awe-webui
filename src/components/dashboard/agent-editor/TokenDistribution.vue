<script setup>
import { ref, watch } from 'vue';
import userAgentAPI from '@/api/v1/user-agent';

import { useRouter } from 'vue-router';
const router = useRouter()
const currentRoute = router.currentRoute.value

import { useAgentStore } from '@/stores/agent';

const agentStore = useAgentStore()

const agentData = agentStore.currentAgent
const agentStatsData = agentStore.currentAgentStats

const sectionOpen = ref(false)

const chargeAwe = async () => {
    alert("Coming soon!")
}

const resetRound = async () => {
    if (!confirm("More tokens could be transferred to the users. Are you sure to reset the round? ")) return
    await userAgentAPI.resetAgentRound(currentRoute.params.agent_id)
}

watch(() => agentData.awe_agent.awe_token_enabled, (enabled) => {
    sectionOpen.value = enabled
});
</script>
<template>
    <section :class="{ 'config-section': true, 'token-distribution': true, 'open': sectionOpen }">

        <h3 class="section-title">
            <div :class="{'section-completed': true, 'yes':agentData.awe_agent.awe_token_enabled && agentStore.tokenReady, 'no':!agentStore.tokenReady || !agentData.awe_agent.awe_token_enabled}">
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
            <div class="collapse-toggle"
                @click="sectionOpen = !!(agentData.awe_agent.awe_token_enabled && !sectionOpen)">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="token-progress-overview" v-if="agentData.awe_agent.awe_token_enabled && !sectionOpen">
            <div class="progress" role="progressbar" aria-label="AWE used this round"
                :aria-valuenow="agentStatsData.awe_token_round_transferred" aria-valuemin="0"
                :aria-valuemax="agentStore.maxQuoteThisRound"
                style="height: 24px">
                <div :class="{
                    'progress-bar':true,
                    'progress-bar-striped':true,
                    'progress-bar-animated':true,
                    'bg-info': agentStore.roundUsedPercentage < 100,
                    'bg-danger': agentStore.roundUsedPercentage === 100,
                    'overflow-visible':true
                    }"
                    :style="{ width: agentStore.roundUsedPercentage + '%' }">
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

            <div class="mb-3 token-used">
                <label class="form-label">Token used this round</label>
                <div class="row">
                    <div class="col col-9">
                        <div class="progress" role="progressbar" aria-label="AWE used this round"
                            :aria-valuenow="agentStatsData.awe_token_round_transferred" aria-valuemin="0"
                            :aria-valuemax="agentStore.maxQuoteThisRound"
                            style="height: 48px">
                            <div :class="{
                                    'progress-bar':true,
                                    'progress-bar-striped':true,
                                    'progress-bar-animated':true,
                                    'bg-info': agentStore.roundUsedPercentage < 100,
                                    'bg-danger': agentStore.roundUsedPercentage === 100,
                                    'overflow-visible':true
                                }"
                                :style="{ width: agentStore.roundUsedPercentage + '%' }">
                                <span style="display:inline-block;padding-left:6px;">
                                    {{ agentStatsData.awe_token_round_transferred }}.00
                                    /
                                    {{ agentStore.maxQuoteThisRound }}.00 AWE
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col col-3 actions">
                        <button class="btn btn-secondary" @click="resetRound">Reset</button>
                    </div>
                </div>
            </div>

            <div class="mb-3 token-left">
                <div class="row">
                    <div class="col col-9">
                        <label class="form-label">Memegent account:</label>
                        <span class="value"><span :class="{'num': true, 'zero': agentStatsData.awe_token_quote === 0}">{{ agentStatsData.awe_token_quote }}.00</span> AWE</span>
                    </div>
                    <div class="col col-3 actions">
                        <button class="btn btn-secondary" @click="chargeAwe">Charge</button>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label for="max-per-tx" class="form-label">Max amount allowed per transaction</label>
                <input
                    v-model="agentData.awe_agent.awe_token_config.max_token_per_tx"
                    type="number"
                    :class="{'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_token_per_tx <= 0}"
                    id="max-per-tx">
            </div>

            <div class="mb-3">
                <label for="max-per-round" class="form-label">Max amount allowed per round</label>
                <input
                    v-model="agentData.awe_agent.awe_token_config.max_token_per_round"
                    type="number"
                    :class="{'form-control': true, 'form-control-lg': true, 'is-invalid': agentData.awe_agent.awe_token_config.max_token_per_round <= 0}"
                    id="max-per-round">
            </div>
        </div>
    </section>
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
.token-distribution .token-left .num.zero
{
    color: #dc3545
}
</style>
