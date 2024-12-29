<script setup>
import { ref, watch, onMounted } from "vue"
import { useRoute } from 'vue-router'
import { useWallet,  WalletMultiButton } from "solana-wallets-vue"
import bs58 from 'bs58'
import { alert } from "@/messages"
import userWalletAPI from "@/api/v1/user-wallet"

const route = useRoute()

const agentId = route.params.agent_id
const tgUserId = route.params.tg_user_id
const timestamp = route.query.timestamp
const signature = route.query.signature
const tgBotUsername = route.query.tg_bot


const pageExpired = ref(false)
const signing = ref(false)
const finished = ref(false)
const inValid = ref(false)

if(!agentId || !tgUserId || !timestamp || !signature || !tgBotUsername) {
    alert("Invalid request. Please DM the Telegram Bot to get a new link.", "danger", 5000)
    inValid.value = true
}

const { connected, publicKey, signMessage } = useWallet()

watch(connected, async (newValue, oldValue) => {
    if(newValue && !oldValue && !pageExpired.value) {

        if(inValid.value)
            return

        // First time connect
        // Trigger verify
        signing.value = true
        const sigStr = "" + timestamp
        const sigBytes = new TextEncoder().encode(sigStr)
        let walletSignature = ""
        try {
            const signatureBytes = await signMessage.value(sigBytes)
            walletSignature = bs58.encode(signatureBytes)
        } catch (e) {
            console.error(e)
            alert("Failed to get the the signature from wallet. Please refresh the page and try again.", "danger", 5000)
            return
        }

        try {
            await userWalletAPI.bindWallet(
                agentId,
                tgUserId,
                publicKey.value,
                timestamp,
                walletSignature,
                signature
            )
        } catch (e) {
            console.error(e)
            alert("Network error. Please refresh the page and try again.", "danger", 5000)
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

onMounted(() => {
    const currentTime = Date.now() / 1000
    if(!timestamp || currentTime - timestamp >= 120) {
        pageExpired.value = false
    }
});

</script>
<template>
<div class="message-box" v-if="!connected && !pageExpired">
    <div class="title">Bind Your Solana Wallet</div>
    <div class="message">
        <div class="text">Please connect your wallet.</div>
        <div class="connect-btn">
            <wallet-multi-button></wallet-multi-button>
        </div>
    </div>
</div>
<div class="message-box" v-if="signing">
    <div class="title">Verify Your Wallet</div>
    <div class="message" >
        <div class="text">
            <p>Please sign the message in the popup using:</p>
            <p class="highlight">{{ publicKey }}</p>
        </div>
        <div class="loading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</div>
<div class="message-box" v-if="pageExpired">
    <div class="title">Page Expired</div>
    <div class="message">
        <div class="text">Page expired! Please DM the Telegram Bot for a new link to bind your wallet.</div>
    </div>
</div>
<div class="message-box" v-if="finished">
    <div class="title">Success</div>
    <div class="message">
        <div class="text">Your wallet is bound successfully. Redirecting back to Telegram in a short while...</div>
    </div>
</div>
</template>
<style scoped>
</style>
