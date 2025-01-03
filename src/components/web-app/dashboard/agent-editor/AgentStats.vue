<script setup>
import { ref } from "vue"
import { useAgentStore } from '@/stores/agent'
import PoolOutChart from "./stats-charts/PoolOutChart.vue"
import PoolInChart from "./stats-charts/PoolInChart.vue"
import StakingCharts from "./stats-charts/StakingCharts.vue"

const agentStore = useAgentStore()
const agentStats = agentStore.currentAgentStats

const sectionCollapsed = ref(false)
const formatNum = (num) => {
    if(!num)
        return 0
    return num.toLocaleString()
}
</script>
<template>
    <section :class="{ 'config-section': true, 'open': !sectionCollapsed }">
        <h3 class="section-title" @click="sectionCollapsed = !sectionCollapsed">
            <div class="section-completed">
                <i class="fa-solid fa-chart-line"></i>
            </div>
            <div class="text">Statistics</div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="section-body">
            <div class="row total-numbers-big">
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Shares</div>
                    <div class="num-value">{{ formatNum(agentStats.total_income_shares) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Emissions</div>
                    <div class="num-value">{{ formatNum(agentStats.total_emissions) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Staking Pool</div>
                    <div class="num-value">{{ formatNum(agentStats.awe_token_staking) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Game Pool</div>
                    <div class="num-value">{{ formatNum(agentStats.awe_token_quote) }}</div>
                </div>
            </div>
            <div class="row total-numbers">
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Users</div>
                    <div class="num-value">{{ formatNum(agentStats.total_users) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Invocations</div>
                    <div class="num-value">{{ formatNum(agentStats.total_invocations) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Out Txs</div>
                    <div class="num-value">{{ formatNum(agentStats.awe_token_total_transactions) }}</div>
                </div>
                <div class="col col-3 stats-number">
                    <div class="num-title">Total Token Out</div>
                    <div class="num-value">{{ formatNum(agentStats.awe_token_total_transferred) }}</div>
                </div>
            </div>
            <div class="row game-pool-charts">
                <div class="col col-6">
                    <pool-in-chart></pool-in-chart>
                </div>
                <div class="col col-6">
                    <pool-out-chart></pool-out-chart>
                </div>
            </div>
            <div class="row staking-charts">
                <staking-charts></staking-charts>
            </div>
        </div>
    </section>
</template>
<style scoped>
.total-numbers-big {
    margin-top: 24px;
}
.total-numbers {
    margin-top: 36px;
}
.stats-number {
    text-align: center;
}
.stats-number .num-value {
    font-family: 'Berlin Sans FB Demi';
    font-size: 30px;
}
.total-numbers-big .stats-number .num-value {
    font-size: 36px;
    color: rgba(69, 248, 130);
}
.game-pool-charts,
.staking-charts {
    margin-top: 44px;
    height: 300px;
}
</style>
