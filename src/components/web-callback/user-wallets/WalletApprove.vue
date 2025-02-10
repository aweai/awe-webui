<script setup>
import { ref, watch, computed } from "vue"
import { useRoute } from 'vue-router'
import { useWallet,  WalletMultiButton } from "solana-wallets-vue"
import { alert } from "@/messages"
import userWalletAPI from "@/api/v1/user-wallet"
import { useAweClient, initAweClient } from "@/sol-client/client"
import config from "@/config.json"

const route = useRoute()

const agentId = route.params.agent_id
const tgUserId = route.params.tg_user_id
const userWallet = route.params.wallet_address
const action = route.query.action
const amount = route.query.amount
const tgBotUsername = route.query.tg_bot

const invalid = ref(false)

if(!agentId || !tgUserId || !userWallet || !amount || !tgBotUsername || !action) {
    alert("Invalid request. Please DM the Telegram Bot to get a new link.", "danger", 5000)
    invalid.value = true
}

const { connected, publicKey } = useWallet()

const signing = ref(false)
const finished = ref(false)
const noBalance = ref(false)

const mismatch = computed(() => publicKey.value != userWallet)

watch(connected, async (newValue, oldValue) => {
    if(newValue && !oldValue){
        if(mismatch.value || invalid.value)return


        try {
            await initAweClient(config.solana.network, config.solana.contracts.awe_mint_address)
        } catch (e) {
            console.error(e)
            alert("Unexpected error. Please refresh the page and try again.", "danger", 5000)
            return
        }

        const aweClient = useAweClient()
        signing.value = true

        // Check user balance
        try {
            const balance = await aweClient.getAweBalance()

            if (balance < BigInt(amount) * BigInt(1000000000)) {
                noBalance.value = true
                return
            }

        } catch (e) {
            console.error(e)
            alert("Error connecting to Solana network. Please refresh the page and try again.", "danger", 5000)
            signing.value = false
            return
        }

        let tx_hash = ""
        try {
            tx_hash = await aweClient.approveAwe(BigInt(amount) * BigInt("1000000000"))
        } catch (e) {
            console.error(e)
            alert("Error sending the approve transaction. Please refresh the page and try again.", "danger", 5000)
            return
        }

        try {
            await userWalletAPI.approve(agentId, tgUserId, action, amount, tx_hash)
        } catch (e) {
            console.error(e)
            alert("Error connecting to Awe server. Please refresh the page and try again.", "danger", 5000)
            return
        }

        // Go back to TG Bot
        signing.value = false
        finished.value = true

        setTimeout(() => {
            window.location = 'https://t.me/' + tgBotUsername
        }, 3000)
    }
})
</script>
<template>
<div class="message-box" v-if="!connected">
    <div class="title">Connect Your Solana Wallet</div>
    <div class="message">
        <div class="text">Please connect your wallet.</div>
        <div class="connect-btn">
            <wallet-multi-button></wallet-multi-button>
        </div>
    </div>
</div>
<div class="message-box" v-if="noBalance">
    <div class="title">Insufficient Fund</div>
    <div class="message">
        <div class="text">You don't have enough AWE in your wallet. Please transfer some to the wallet and try again.</div>
    </div>
</div>
<div class="message-box" v-if="connected && mismatch">
    <div class="title">Wrong Wallet</div>
    <div class="message">
        <div class="text">
            <p>
                Connected wallet is different than the wallet bound to the bot.
                Please use the bound wallet to approve the transaction,
                or rebind a new wallet using the bot.
            </p>
            <p class="plain-text">Connected: {{ publicKey }}</p>
            <p class="plain-text">Bound: {{ userWallet }}</p>
        </div>
    </div>
</div>
<div class="message-box" v-if="signing">
    <div class="title">Approve the transaction</div>
    <div class="message">
        <div class="text">
            <p>Please approve Awe to collect the payment from your wallet.</p>
            <p class="highlight">{{ publicKey }}</p>
            <p class="highlight">AWE {{ amount }}.00</p>
        </div>
        <div class="loading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</div>
<div class="message-box" v-if="finished">
    <div class="title">Success</div>
    <div class="message">
        <div class="text">Your payment is processing in the background. Redirecting back to Telegram in a short while...</div>
    </div>
</div>
</template>
<style scoped>
.message-box .plain-text {
    font-family:'Barlow', sans-serif;
    font-weight: normal;
}
</style>
