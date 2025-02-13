<script setup>
import { RouterView, useRouter } from 'vue-router'
import { useWallet, initWallet } from "solana-wallets-vue"
import { watch } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"

import v1Client from '@/api/v1/v1'
import config from '@/config.json'
import { initAweClient } from '@/sol-client/client'
import {alert, waiting, closeWaiting} from '@/messages'

const walletStore = useWalletStore()
const userStore = useUserStore()

const router = useRouter()

router.isReady().then(() => {

    const walletOptions = {
        wallets: [
            new SolflareWalletAdapter({ network: config.solana.network }),
        ],
        autoConnect: router.currentRoute.value.path !== "/" && router.currentRoute.value.path !== "/memegents",
    }

    initWallet(walletOptions);
    userStore.walletInitialized = true

    const { connected, publicKey } = useWallet()

    watch(connected, async (newConnected) => {

        if (newConnected) {

            console.log("wallet connected!")

            if (!walletStore.isTokenValid || publicKey.value != walletStore.address) {
                waiting("Please confirm the signature in the popup of the wallet...")
                try {
                    await walletStore.generateAccessToken()
                    console.log("auth token generated!")
                } catch (e) {
                    console.error(e)
                    closeWaiting()
                    setTimeout(() => {
                        alert("Unexpected error in sign in process. Please try again later.", "danger", 5000)
                    }, 1000)
                    return
                }
            } else {
                waiting("Signing in. Please wait...")
            }

            if (!walletStore.isTokenValid) {
                closeWaiting()
                alert("Sign in not completed. Please try again later.", "danger", 5000)
                return
            }

            v1Client.setAuthToken(walletStore.token)

            console.log("auth token valid!")

            try {
                await initAweClient(config.solana.network, config.solana.contracts.awe_mint_address)
                await walletStore.refreshNumbersOnChain()
                console.log("onchain data updated!")
            } catch (e) {
                console.error(e)
                setTimeout(() => {
                    alert("Error connecting to the Solana network. Please try again later.", "danger", 5000)
                    }, 1000)
                return
            } finally {
                closeWaiting()
            }

            userStore.signedIn = true

            console.log("user signed in!")

            if (router.currentRoute.value.name == "index" || router.currentRoute.value.name == "memegents") {
                router.push({ name: 'dashboard' })
            }

        } else {
            if (router.currentRoute.value.name != "index") {
                router.replace({ name: 'index' })
            }
        }
    });
});
</script>

<template>
    <router-view />
</template>
