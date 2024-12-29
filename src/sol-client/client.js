import { useAnchorWallet } from "solana-wallets-vue";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount,
    getAssociatedTokenAddress,
    TokenAccountNotFoundError,
    createApproveCheckedInstruction
} from "@solana/spl-token";
import idl from "./awe.json";
import { Buffer } from "buffer";

const preflightCommitment = "processed";
const commitment = "confirmed";

class AweClient {
    async init(network, aweMetadataAddress) {
        const wallet = useAnchorWallet();
        const connection = new Connection(clusterApiUrl(network), commitment);
        const provider = new AnchorProvider(connection, wallet.value, {
            preflightCommitment,
            commitment,
        })
        this.program = new Program(idl, provider)
        this.aweMetadataAddress = aweMetadataAddress
        this.aweMetadataPublicKey = new PublicKey(aweMetadataAddress)
        await this.loadAweMetadata()
    }

    async loadAweMetadata() {
        this.aweMetadata = await this.program.account.aweMetadata.fetch(this.aweMetadataAddress, "confirmed")
    }

    getWalletAddress() {
        return this.program.provider.publicKey.toBase58()
    }

    async getSolBalance() {
        try {
            const provider = this.program.provider
            return BigInt(await provider.connection.getBalance(provider.publicKey, commitment))
        } catch (e) {
            console.error(e)
            return BigInt(0)
        }
    }

    async getAweBalance() {
        try {
            const tokenAccountAddress = await getAssociatedTokenAddress(
                this.aweMetadata.aweMintAccount,
                this.program.provider.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const tokenAccount = await getAccount(
                this.program.provider.connection,
                tokenAccountAddress,
                null,
                TOKEN_2022_PROGRAM_ID
            );

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

    async getAgentCreatorAccount () {
        const program = this.program
        const provider = program.provider

        const [agentCreatorAccountAddress, ] = PublicKey.findProgramAddressSync(
            [Buffer.from("agent_creator"), this.aweMetadataPublicKey.toBuffer(), provider.publicKey.toBuffer()],
            program.programId
        )

        try {
            const agentCreatorAccountData = await program.account.agentCreator.fetch(
                agentCreatorAccountAddress,
                "confirmed"
            )

            return agentCreatorAccountData

        } catch (e) {
            if(/Account does not exist/.test(e.toString())) {
                return null
            } else {
                console.error("Error getting agent creator account at: ", agentCreatorAccountAddress)
                throw(e)
            }
        }
    }

    async getAgentCreationQuote() {
        let agentCreatorAccountData = await this.getAgentCreatorAccount()
        if(!agentCreatorAccountData) {
            return 0
        } else {
            return agentCreatorAccountData.numAgents
        }
    }

    async createAgent() {

        // 1. Approve program delegate to transfer AWE from this account
        const provider = this.program.provider

        const [delegatePublicKey, ] = PublicKey.findProgramAddressSync(
            [Buffer.from("delegate")],
            this.program.programId
        )

        const providerTokenAccountPublicKey = await getAssociatedTokenAddress(
            this.aweMetadata.aweMintAccount,
            provider.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const approveInstruction = createApproveCheckedInstruction(
            providerTokenAccountPublicKey,
            this.aweMetadata.aweMintAccount,
            delegatePublicKey,
            provider.publicKey,
            BigInt(this.aweMetadata.agentPrice.toString(10)),
            9,
            [],
            TOKEN_2022_PROGRAM_ID
        )

        // 2. Create the agent

        let agentCreatorAccountData = await this.getAgentCreatorAccount()

        let aweMethod

        if(!agentCreatorAccountData) {
            console.log("Init new Agent Creator Account")
            aweMethod = this.program.methods.initAgentCreator
        } else {
            console.log("numAgents before update: ", agentCreatorAccountData.numAgents.toString())
            aweMethod = this.program.methods.createAgent
        }

        await aweMethod()
            .accounts({
                aweMetadataAccount: this.aweMetadataPublicKey,
                aweMintAccount: this.aweMetadata.aweMintAccount,

                // Awe payer info
                aweSenderAccount: providerTokenAccountPublicKey,
                aweCollectorAccount: this.aweMetadata.aweCollectorAccount,
                delegate: delegatePublicKey,

                tokenProgram: TOKEN_2022_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
            .preInstructions([approveInstruction])
            .rpc({ commitment: "confirmed" })
    }

    // Approve the awe collector account to transfer AWE from user's wallet
    async approveAwe (delegateAmount) {
        const provider = this.program.provider
        const connection = provider.connection;
        const recentBlockhash = await connection.getLatestBlockhash();

        const providerTokenAccountPublicKey = await getAssociatedTokenAddress(
            this.aweMetadata.aweMintAccount,
            provider.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let tx = new Transaction({
            lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
            blockhash: recentBlockhash.blockhash,
            feePayer: provider.publicKey
        }).add(
            createApproveCheckedInstruction(
                providerTokenAccountPublicKey,
                this.aweMetadata.aweMintAccount,
                this.aweMetadata.aweCollectorAccount,
                provider.publicKey,
                delegateAmount,
                9,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        )

        const txSignature = await provider.sendAndConfirm(tx);
        console.log("Approve: ", txSignature)
        return txSignature
    };
}

let aweClient = null
export const useAweClient = () => {
    if (!aweClient) {
        throw new Error("Awe client not initialized!")
    }
    return aweClient
}

export const initAweClient = async (network, aweMetadataAddress) => {
    aweClient = new AweClient()
    await aweClient.init(network, aweMetadataAddress)
    return aweClient
}
