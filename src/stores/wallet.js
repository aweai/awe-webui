import { defineStore } from 'pinia'
import { useWallet } from "solana-wallets-vue"
import { encode } from 'js-base64'
import bs58 from 'bs58'
import { useAweClient } from '@/sol-client/client'
import config from '@/config.json'

const formatTokenValue = (original) => {
    if(original === 0) return "0.00"

    let decimal = "" + original / BigInt(1e7) % BigInt(100)
    if (decimal.length == 1) {
        decimal = "0" + decimal
    }

    return "" + (original / BigInt(1e9)).toString() + "." + decimal
}

export const useWalletStore = defineStore('wallet', {
    state: () => ({
        address: "",
        balanceSolOriginalStr: "",
        balanceAweOriginalStr: "",
        agentPriceOriginalStr: "",
        accessToken: {
            expires: 0,
            encoded: ""
        }
    }),
    getters: {
        isTokenValid: (state) => {
            return state.address != "" && state.accessToken.expires >= Math.floor(Date.now() / 1000)
        },
        token: (state) => state.accessToken.encoded,
        balanceSol: (state) => {
            return BigInt(state.balanceSolOriginalStr)
        },
        balanceSolStr: (state) => {
            return formatTokenValue(state.balanceSol)
        },
        balanceAwe: (state) => {
            return BigInt(state.balanceAweOriginalStr)
        },
        balanceAweStr: (state) => {
            return formatTokenValue(state.balanceAwe)
        },
        agentPrice: (state) => {
            return BigInt(state.agentPriceOriginalStr)
        },
        agentPriceStr: (state) => {
            return formatTokenValue(state.agentPrice)
        }
    },
    actions: {
        async generateAccessToken() {

            const { signMessage, publicKey } = useWallet()

            if(!signMessage.value) {
                throw Error("signMessage is not supported")
            }

            const newToken = {
                expires: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
                public_key: publicKey.value
            }

            try {
                const newTokenStr = JSON.stringify(newToken)
                const newTokenBytes = new TextEncoder().encode(newTokenStr)
                const signatureBytes = await signMessage.value(newTokenBytes)
                const sigStr = bs58.encode(signatureBytes)
                this.accessToken.expires = newToken.expires
                newToken.signature = sigStr
                this.accessToken.encoded = encode(JSON.stringify(newToken))
                this.address = publicKey.value

                console.log("Public key: " + publicKey.value)
                console.log("Message str: " + newTokenStr)
                console.log("Signature str: " + sigStr)

            } catch (e) {
                console.error(e)
                this.invalidateAccessToken()
            }
        },
        invalidateAccessToken() {
            this.address = ""
            this.accessToken.expires = 0
            this.accessToken.encoded = ""
        },
        async refreshNumbersOnChain() {
            const aweClient = useAweClient()
            this.agentPriceOriginalStr = config.agent_price + "000000000"
            this.balanceSolOriginalStr = (await aweClient.getSolBalance()).toString()
            this.balanceAweOriginalStr = (await aweClient.getAweBalance()).toString()
        }
    },
    persist: {
        key: 'awe_user_wallet_data',
        debug: true
    }
})
