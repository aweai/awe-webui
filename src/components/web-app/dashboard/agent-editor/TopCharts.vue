<script setup>
import IncomeChart from './stats-charts/IncomeChart.vue'
import { useAgentStore } from '@/stores/agent';
import { computed, ref } from 'vue';
import config from '@/config.json'

const agentStore = useAgentStore()

const withdrawAmountValid = computed(() => {
    return Number.isInteger(withdrawAmount.value) && withdrawAmount.value >= config.min_withdraw_amount
})

const enoughBalance = computed(() => {
    if (!withdrawAmountValid.value)
        return false
    return withdrawAmount.value + config.withdraw_tx_fee <= agentStore.currentAgentStats.awe_token_creator_balance
})

const withdrawAmount = ref(1000)
const withdraw = async () => {

}

</script>
<template>
    <div class="row stats-charts">
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content">
                    <income-chart :agent-id="agentStore.currentAgentId"></income-chart>
                </div>
            </div>
        </div>
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content withdraw-panel">
                    <div class="account-title">Memegent Account</div>
                    <div class="account-balance">{{ agentStore.currentAgentStats.awe_token_creator_balance.toLocaleString() }}.00</div>
                    <div class="account-withdraw">
                        <a class="btn btn-secondary" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#withdrawModal"><span>Withdraw</span></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="awe-modal modal fade" id="withdrawModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="resetRound" data-bs-theme="light">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetRound">Withdraw to your wallet</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-start">
                    <div class="charge-message">
                        <p>Withdraw $AWE from the Memegent account to your wallet. </p>
                        <p>A transaction fee of $AWE {{ config.withdraw_tx_fee }}.00 will be charged on your account.</p>
                        <p>Please input the amount you want to withdraw. (Minimum {{ config.min_withdraw_amount }})</p>
                    </div>
                    <div class="mb-3">
                        <div class="input-group mb-3 input-group-lg has-validation">
                            <span class="input-group-text" id="basic-addon1">$AWE</span>
                            <input type="text" :class="{'form-control':true, 'is-invalid':!withdrawAmountValid || !enoughBalance}" placeholder="1000" v-model.number="withdrawAmount"/>
                            <div class="invalid-feedback" v-if="!withdrawAmountValid">
                                Must be an integer. At least $AWE {{ config.min_withdraw_amount }}. Decimals not supported.
                            </div>
                            <div class="invalid-feedback" v-if="withdrawAmountValid && !enoughBalance">
                                Not enough $AWE in the Memegent account: {{ withdrawAmount + config.withdraw_tx_fee }} / {{ agentStore.currentAgentStats.awe_token_creator_balance }}
                            </div>
                        </div>
                        <div class="form-text" v-if="withdrawAmountValid && enoughBalance">
                            $AWE {{ withdrawAmount }} + {{ config.withdraw_tx_fee }} will be removed from your Memegent account.
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-secondary" @click="withdraw"
                        data-bs-dismiss="modal"><span>Withdraw</span></button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.stats-charts {
    position: relative;
    height: 100%;
}

.stats-panel {
    position: relative;
    height: 100%;
}

.stats-panel .stats-panel-bg {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #1b242e;
    box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.21);
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    -o-border-radius: 8px;
    -ms-border-radius: 8px;
    border-radius: 8px;
    z-index: 1;
}

.stats-panel .stats-panel-content {
    position: relative;
    z-index: 2;
    padding: 16px;
    height: 100%;
}

.withdraw-panel {
    text-align: center
}

.withdraw-panel .account-title {
    font-size: 18px;
    font-family: 'Berlin Sans FB Demi';
}

.withdraw-panel .account-balance {
    font-family: 'Berlin Sans FB Demi';
    color: rgba(69, 248, 130);
    font-size: 40px;
    margin-top: 36px;
}
.withdraw-panel .account-withdraw {
    margin-top: 48px;
}
</style>
