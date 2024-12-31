<script setup>
import { ref } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { useAweClient } from '@/sol-client/client';
import { alert, waiting, closeWaiting } from '@/messages.js';
import config from '@/config.json'

const walletStore = useWalletStore()

const loading = ref(false)
const createAgent = async () => {

    const confirmModal = window.bootstrap.Modal.getInstance(document.getElementById('confirmPayment'));
    if (confirmModal)
        confirmModal.hide()

    if (loading.value)
        return

    loading.value = true

    waiting("Please confirm the transaction in the popup of the wallet...")
    const aweClient = useAweClient()

    try {
        await aweClient.createAgent()
    } catch (e) {
        console.error(e)
        alert("Unexpected error when creating the Memegent. Please try again.", "danger", 5000)
        closeWaiting()
        loading.value = false
        return
    }

    try {
        await walletStore.refreshNumbersOnChain()
    } catch (e) {
        console.error(e)
        alert("Unexpected error when reloading the data. Please refresh the page.", "danger", 5000)
    } finally {
        closeWaiting()
        loading.value = false
    }
}

const confirmCreateAgent = () => {
    if (walletStore.balanceAwe < walletStore.agentPrice) {
        alert("Your do not have enough AWE to create a new Memegent.", "danger", 5000)
        return
    }
    if (walletStore.balanceSol < 1e7) {
        alert("Your do not have enough SOL to send transactions.", "danger", 5000)
        return
    }

    const confirmModal = new window.bootstrap.Modal(document.getElementById('confirmPayment'));
    confirmModal.show()
};

</script>
<template>
    <div class="create-memegent">
        <a class="btn btn-primary" href="javascript:void(0)" @click="confirmCreateAgent">
            <span>Create Memegent</span>
        </a>
        <div class="price">Staking Amount: <span class="num">{{ walletStore.agentPriceStr }}</span> AWE</div>
        <div class="balance">
            Your balance:
            <span :class="{ 'num': true, 'insufficient': walletStore.balanceAwe < walletStore.agentPrice }">{{
                walletStore.balanceAweStr }}</span> AWE,
            <span :class="{ 'num': true, 'insufficient': walletStore.balanceSol < 1e7 }">{{ walletStore.balanceSolStr
                }}</span> SOL
        </div>
    </div>
    <div class="awe-modal modal fade" id="confirmPayment" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labelledby="createNewMemegent">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createNewMemegent">Create New Memegent</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row confirm-message justify-content-center">
                        <div class="col col-10">
                            Please confirm the staking below. The staked tokens will be transferred to the
                            system account,
                            and will be returned after you terminate the Memegent.
                        </div>
                    </div>
                    <div class="row confirm-item price-confirm">
                        <div class="col col-1"></div>
                        <div class="col col-2">
                            Staking
                        </div>
                        <div class="col col-8 value">
                            <span class="num">{{ walletStore.agentPriceStr }}</span> AWE
                        </div>
                        <div class="col col-1"></div>
                    </div>
                    <div class="row confirm-item price-confirm">
                        <div class="col col-1"></div>
                        <div class="col col-2">
                            Min lock
                        </div>
                        <div class="col col-8 value">
                            <span class="num">{{ config.solana.agent_creator_staking_lock }}</span> Days
                        </div>
                        <div class="col col-1"></div>
                    </div>
                    <div class="row confirm-item address-confirm">
                        <div class="col col-1"></div>
                        <div class="col col-2">
                            Wallet
                        </div>
                        <div class="col col-8 value">
                            <span class="address">{{ walletStore.address }}</span>
                        </div>
                        <div class="col col-1"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-secondary" @click="createAgent"><span>Confirm</span></button>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.create-memegent {
    text-align: center;
    font-family: 'Berlin Sans FB';
}

.price {
    margin-top: 16px;
    font-size: 24px;
}

.price .num {
    font-size: 48px;
    color: rgba(69, 248, 130);
}

.balance {
    font-size: 18px;
}

.balance .num {
    color: white;
    font-size: 22px;
}

.balance .num.insufficient {
    color: #842029;
}

#confirmPayment .confirm-message {
    margin-top: 24px;
    margin-bottom: 48px;
}

#confirmPayment .confirm-message .col::after {
    content: "";
    display: block;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px 0px 0px;
}

#confirmPayment .confirm-item {
    line-height: 40px;
}

#confirmPayment .confirm-item .value {
    text-align: right;
}

#confirmPayment .price-confirm .num {
    font-size: 40px;
    color: rgba(69, 248, 130);
}

#confirmPayment .address-confirm {
    margin-bottom: 24px;
}

#confirmPayment .address-confirm .value {
    font-size: 16px;
}
</style>
