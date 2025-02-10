import { useAnchorWallet } from 'solana-wallets-vue'
import { AnchorProvider } from '@coral-xyz/anchor'
import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js'
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount,
    getAssociatedTokenAddress,
    TokenAccountNotFoundError,
    createApproveCheckedInstruction,
} from '@solana/spl-token'
import config from '@/config'

const preflightCommitment = 'processed'
const commitment = 'confirmed'

class AweClient {
    async init(network, aweMintAddress) {
        const wallet = useAnchorWallet()
        const connection = new Connection(clusterApiUrl(network), commitment)
        this.provider = new AnchorProvider(connection, wallet.value, {
            preflightCommitment,
            commitment,
        })
        this.aweMintAccount = new PublicKey(aweMintAddress)
    }

    getWalletAddress() {
        return this.provider.publicKey.toBase58()
    }

    async getSolBalance() {
        try {
            const provider = this.provider
            return BigInt(await provider.connection.getBalance(provider.publicKey, commitment))
        } catch (e) {
            console.error(e)
            return BigInt(0)
        }
    }

    async getAweBalance() {
        try {
            const tokenAccountAddress = await getAssociatedTokenAddress(
                this.aweMintAccount,
                this.provider.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID,
            )

            const tokenAccount = await getAccount(
                this.provider.connection,
                tokenAccountAddress,
                null,
                TOKEN_2022_PROGRAM_ID,
            )

            return tokenAccount.amount
        } catch (e) {
            if (e instanceof TokenAccountNotFoundError) {
                return BigInt(0)
            } else {
                console.error(e)
                return BigInt(0)
            }
        }
    }

    // Approve the awe collector account to transfer AWE from user's wallet
    async approveAwe(delegateAmount) {
        const provider = this.provider
        const connection = provider.connection
        const recentBlockhash = await connection.getLatestBlockhash()

        const providerTokenAccountPublicKey = await getAssociatedTokenAddress(
            this.aweMintAccount,
            provider.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        )

        const systemPayerPubKey = new PublicKey(config.solana.system_payer_public_key)

        let tx = new Transaction({
            lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
            blockhash: recentBlockhash.blockhash,
            feePayer: provider.publicKey,
        }).add(
            createApproveCheckedInstruction(
                providerTokenAccountPublicKey,
                this.aweMintAccount,
                systemPayerPubKey,
                provider.publicKey,
                delegateAmount,
                9,
                [],
                TOKEN_2022_PROGRAM_ID,
            ),
        )

        const txSignature = await provider.sendAndConfirm(tx)
        console.log('Approve: ', txSignature)
        return txSignature
    }
}

let aweClient = null
export const useAweClient = () => {
    if (!aweClient) {
        throw new Error('Awe client not initialized!')
    }
    return aweClient
}

export const initAweClient = async (network, aweMintAddress) => {
    aweClient = new AweClient()
    await aweClient.init(network, aweMintAddress)
    return aweClient
}
