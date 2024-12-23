<script setup>
import { RouterView, useRouter } from 'vue-router'
import { WalletMultiButton, useWallet, initWallet } from "solana-wallets-vue"
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { useWalletStore } from './stores/wallet'
import { useUserStore } from './stores/user'
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"

import v1Client from './api/v1/v1'
import config from '@/config.json'
import { initAweClient } from './sol-client/client'
import {alert, waiting, closeWaiting} from './messages'

import '@/assets/js/bootstrap.bundle.min.js'
import '@/assets/js/all.min.js'

const walletStore = useWalletStore()
const userStore = useUserStore()

const router = useRouter()
const walletInitialized = ref(false)

router.isReady().then(() => {

    const walletOptions = {
        wallets: [
            new SolflareWalletAdapter({ network: config.solana.network }),
        ],
        autoConnect: router.currentRoute.value.path !== "/",
    }

    initWallet(walletOptions);
    walletInitialized.value = true

    const { connected, publicKey } = useWallet()

    watch(connected, async (newConnected) => {
        if (newConnected) {
            if (!walletStore.isTokenValid || publicKey.value != walletStore.address) {
                waiting("Please confirm the signature in the popup of the wallet...")
                try {
                    await walletStore.generateAccessToken()
                } catch (e) {
                    console.error(e)
                    closeWaiting()
                    alert("Unexpected error in sign in process. Please try again later.", "danger", 5000)
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

            try {
                await initAweClient(config.solana.network, config.solana.contracts.awe_metadata_address)
                await walletStore.refreshNumbersOnChain()
            } catch (e) {
                console.error(e)
                alert("Error connecting to the Solana network. Please try again later.", "danger", 5000)
            } finally {
                closeWaiting()
            }

            userStore.signedIn = true

            if (router.currentRoute.value.name == "index") {
                router.push({ name: 'dashboard' })
            }

        } else {
            if (router.currentRoute.value.name != "index") {
                router.replace({ name: 'index' })
            }
        }
    });
});

const headerSticky = ref(false)
const toTopBtnOpaticy = ref(0)
const handleScroll = () => {
    headerSticky.value = window.scrollY > 60
    toTopBtnOpaticy.value = window.scrollY > 500 ? 1 : 0
}
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    })
}


onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})

</script>

<template>
    <div id="global-alert"></div>
    <header :class="{'header-area': true, 'sticky': headerSticky}">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="header-main d-flex justify-content-between align-items-center">
                        <div class="header-logo">
                            <a href="/"><img src="./assets/images/logo.png" alt="logo"></a>
                        </div>
                        <div class="header-right d-flex align-items-center">
                            <nav class="navbar navbar-expand-lg">
                                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                    <div class="sandwitch">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </button>
                                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                        <li :class="{'nav-item': true, 'active': router.currentRoute.value.name == 'index'}">
                                            <a class="nav-link" href="/">Home</a>
                                        </li>
                                        <li v-if="userStore.signedIn" :class="{'nav-item': true, 'active': ['dashboard', 'agent'].includes(router.currentRoute.value.name)}">
                                            <a class="nav-link" href="/dashboard">Dashboard</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" href="https://t.me/awe" target="_blank">Telegram</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" href="https://x.com/awe_ai" target="_blank">Twitter</a>
                                        </li>
                                    </ul>
                                    <div class="header-btn ms-3">
                                        <wallet-multi-button
                                            v-if="walletInitialized"></wallet-multi-button>
                                    </div>
                                </div>
                            </nav>
                            <div class="header-btn ms-3">
                                <wallet-multi-button class="btn btn-secondary"
                                    v-if="walletInitialized"></wallet-multi-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="main--area p-120 pt-0">
        <RouterView />
    </main>

    <footer class="footer-style-two has-footer-animation" id="contact">
        <div class="footer__country">
            <div class="container custom-container">
                <div class="row">
                    <div class="col-6">
                        <div class="section-title mb-30">
                            <h2><span>Memegents</span></h2>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="section-title mb-30 text-center text-sm-end">
                            <h2><span>AWE</span></h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer__two-widgets">
            <div class="container custom-container">
                <div class="row">
                    <div class="col-md-4 col-sm-7 order-1 order-md-0">
                        <div class="footer-el-widget">
                            <h4 class="title">Partners</h4>
                            <div class="footer-el-menu">
                                <ul class="list-wrap start">
                                    <li><a href="https://solana.com" target="_blank">Solana</a></li>
                                    <li><a href="https://crynux.ai" target="_blank">Crynux</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-sm-5 order-0 order-md-2">
                        <div class="footer-el-widget text-start text-md-center widget_nav_menu">
                            <div class="footer-el-logo mb-30">
                                <a href="/"><img src="./assets/images/logo.png" alt="Awe Homepage"></a>
                            </div>
                            <div class="footer-el-menu">
                                <ul class="list-wrap">
                                    <li><a href="https://aweai.fun" target="_blank">Home</a></li>
                                    <li><a href="https://t.me/awe_ai" target="_blank">Contact us</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-sm-7 order-3">
                        <div class="footer-el-widget text-start text-md-end">
                            <h4 class="title">Community</h4>
                            <div class="footer-el-menu">
                                <ul class="list-wrap end">
                                    <li><a href="">X/Twitter</a></li>
                                    <li><a href="">Telegram</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="copyright__wrap -style-two">
            <div class="container custom-container">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <div class="copyright__text text-center text-lg-start">
                            <p>Copyright &copy;2024 Awe. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    <div id="to-top" :style="{'opacity': toTopBtnOpaticy, 'cursor': 'pointer'}" @click="scrollToTop"><i class="fas fa-arrow-up fa-fw"></i></div>
    <div class="awe-modal modal fade" id="confirmTransaction" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="confirmTransaction">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="row confirm-message">
                        <div class="col col-12" id="confirm-message-container">
                            Please confirm in the popup of the wallet.
                        </div>
                    </div>
                    <div class="row waiting">
                        <div class="col col-12">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Waiting...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
#global-alert {
    position: fixed;
    width: 70%;
    top: 94px;
    left: 15%;
    font-family: 'Berlin Sans FB';
    z-index: 999999999;
}
.header-btn p {
    margin-top: auto;
    margin-bottom: auto;
}
a, a:focus,
button, button:focus,
input, input:focus {
    appearance: none !important;
    outline:0 !important;
    box-shadow: none !important;
    -webkit-appearance:none !important;
    -moz-box-shadow: none !important;
    -webkit-box-shadow: none !important;
}
#confirmTransaction .confirm-message {
    margin-top: 32px;
    text-align: center;
}
#confirmTransaction .waiting {
    margin: 64px auto;
}
</style>
<style>
@import "./assets/css/bootstrap.min.css";
@import "./assets/css/all.min.css";
@import "./assets/css/style.css";
@import "./assets/css/responsive.css";
@import "./assets/css/awe.modal.css";
</style>
