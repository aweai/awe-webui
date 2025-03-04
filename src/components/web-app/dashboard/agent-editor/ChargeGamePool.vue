<script setup>
import { ref, computed } from 'vue'
import { waiting, alert, closeWaiting } from '@/messages'
import { useAweClient } from '@/sol-client/client'
import userAgentAPI from '@/api/v1/user-agent'
import { useAgentStore } from '@/stores/agent'
import { useWalletStore } from '@/stores/wallet'
import config from '@/config.json'

const aweClient = useAweClient()
const agentStore = useAgentStore()
const walletStore = useWalletStore()

const chargeAmount = ref(100)

const chargeAmountValid = computed(() => {
    return Number.isInteger(chargeAmount.value) && chargeAmount.value >= config.min_game_pool_charge
})

const charging = ref(false)

const charge = async () => {
    if(!chargeAmountValid.value || charging.value) return

    if (walletStore.balanceAwe < BigInt(chargeAmount.value) * BigInt(1e9)) {
        alert("You don't have enough $AWE in your wallet: " + walletStore.balanceAweStr, "danger", 5000)
        return
    }

    if (walletStore.balanceSol < BigInt(1e7)) {
        alert("You don't have enough $SOL in your wallet: " + walletStore.balanceSolStr, "danger", 5000)
        return
    }

    charging.value = true
    waiting("Please confirm the transaction in the popup of the wallet.")

    let approveTx

    try {
        approveTx = await aweClient.approveAwe(BigInt(chargeAmount.value) * BigInt(1e9))
    } catch(e) {
        console.error(e)
        alert("Error sending the approve transaction, please try again later.", "danger", 5000)
        charging.value = false
        closeWaiting()
        return
    }

    try {
        await userAgentAPI.chargeGamePool(agentStore.currentAgentId, chargeAmount.value, approveTx)
        alert("Processing the deposit in the background. Please refresh the page and check the game pool balance later.", "success", 8000)
    } catch(e) {
        console.error(e)
        alert("Error connecting to the server, please try again later.", "danger", 5000)
    } finally {
        charging.value = false
        closeWaiting()
    }
}
</script>
<template>
<button v-if="!charging" type="button" class="btn btn-secondary" data-bs-toggle="modal"
    data-bs-target="#chargeGamePool">Deposit</button>

<div v-if="charging" class="spinner-border" role="status"
    style="margin-top: 8px;margin-right: 16px;">
    <span class="visually-hidden">Depositing...</span>
</div>

<div class="awe-modal modal fade" id="chargeGamePool" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="resetRound" data-bs-theme="light">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetRound">Deposit to the Game Pool</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-start">
                    <div class="charge-message">
                        <p>Load $AWE into the game pool for the players.</p>
                        <p>Once added, withdrawals are not allowed.</p>
                        <p>Please enter the amount you wish to load into the game pool:</p>
                    </div>
                    <div class="mb-3">
                        <div class="input-group mb-3 input-group-lg has-validation">
                            <span class="input-group-text" id="basic-addon1">$AWE</span>
                            <input type="text" :class="{'form-control':true, 'is-invalid':!chargeAmountValid}" placeholder="1000" v-model.number="chargeAmount"/>
                            <div class="invalid-feedback">
                                Must be an integer. At least $AWE {{ config.min_game_pool_charge }}. Decimals not supported.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-secondary" @click="charge"
                        data-bs-dismiss="modal"><span>Deposit</span></button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
#chargeGamePool .modal-body {
    padding: 32px;
}
</style>
