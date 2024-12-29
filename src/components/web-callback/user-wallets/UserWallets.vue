<script setup>
import { RouterView } from 'vue-router'
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import config from "@/config.json"
import { initWallet } from "solana-wallets-vue"

const walletOptions = {
    wallets: [
        new SolflareWalletAdapter({ network: config.solana.network }),
    ],
    autoConnect: true
}

initWallet(walletOptions);
</script>
<template>
    <div class="user-wallets">
        <router-view />
    </div>
</template>
<style>
.user-wallets {
    margin-top: 160px;
}
.user-wallets .message-box {
    position: relative;
    width: 100%;
    min-height: 200px;
    background-color: #FFF;
    border-radius: 10px;
    overflow: hidden;
    padding: 36px;
    font-family: 'Berlin Sans FB Demi';
}
.user-wallets .message-box .title {
    color: #333;
    font-size: 26px;
}
.user-wallets .message-box .title::after
{
    content: "";
    display: block;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px 0px 0px;
}
.user-wallets .message-box .message {
    padding: 48px;
}
.user-wallets .message-box .message .text {
    text-align: center;
    color: #555;
    margin-top: 48px;
}

.user-wallets .message-box .message .text .highlight {
    color: rgba(69, 248, 130);
}

.user-wallets .message-box .message .loading {
    text-align: center;
    margin: 36px 0;
}
.user-wallets .connect-btn {
    margin-top: 36px;
}
.user-wallets .connect-btn div {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
