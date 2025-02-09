import { defineStore } from 'pinia'
import userAgentAPI from '@/api/v1/user-agent'
import config from '@/config.json'

const emptyAgent = {
    name: '',
    enabled: false,
    staking_amount: 100,
    created_at: 0,
    tg_bot: {
        username: '',
        token: '',
        start_message: '',
    },
    awe_agent: {
        llm_config: {
            model_name: 'mistralai/Mistral-7B-Instruct-v0.3',
            hf_token: '',
            prompt_preset: '',
        },
        awe_token_enabled: true,
        awe_token_config: {
            max_token_per_tx: 10,
            max_token_per_round: 100,
            user_price: 100,
            game_pool_division: 70,
            max_payment_per_round: 0,
            max_invocation_per_payment: 0
        },
        image_generation_enabled: false,
        image_generation_args: {
            version: '2.0.0',
            prompt: '',
            base_model: {
                name: 'crynux-ai/sdxl-turbo',
                variant: null,
            },
            lora: {
                model: '',
                weight_file_name: '',
                weight: 100,
            },
            task_config: {
                num_images: 1,
                steps: 1,
                cfg: 0,
                safety_checker: false,
            },
        },
    },
}

export const useAgentStore = defineStore('agent', {
    state: () => ({
        currentAgentId: 0,
        currentAgent: JSON.parse(JSON.stringify(emptyAgent)),
        currentAgentStats: {
            awe_token_round_transferred: 0,
            awe_token_total_transferred: 0,
            awe_token_creator_balance: 0,
            awe_token_quote: 0,
            current_round: 1,
            awe_token_staking: 0,
            total_invocations: 0,
            total_users: 0,
            total_emissions: 0,
            total_income_shares: 0,
            awe_token_total_transactions: 0,
            awe_token_total_addresses: 0
        },
    }),
    getters: {
        maxQuoteThisRound(state) {
            if (
                state.currentAgent.awe_agent.awe_token_config.max_token_per_round >=
                state.currentAgentStats.awe_token_quote
            ) {
                return (
                    state.currentAgentStats.awe_token_quote +
                    state.currentAgentStats.awe_token_round_transferred
                )
            } else {
                return state.currentAgent.awe_agent.awe_token_config.max_token_per_round
            }
        },
        roundUsedPercentage(state) {
            if (this.maxQuoteThisRound === 0) {
                return 0
            } else if (
                state.currentAgent.awe_agent.awe_token_config.max_token_per_round >=
                state.currentAgentStats.awe_token_quote
            ) {
                return Math.floor(
                    (state.currentAgentStats.awe_token_round_transferred * 100) /
                        (this.maxQuoteThisRound +
                            state.currentAgentStats.awe_token_round_transferred),
                )
            } else {
                return Math.floor(
                    (state.currentAgentStats.awe_token_round_transferred * 100) /
                        state.currentAgent.awe_agent.awe_token_config.max_token_per_round,
                )
            }
        },
        tgBotReady(state) {
            return (
                state.currentAgent.tg_bot.username !== '' &&
                state.currentAgent.tg_bot.token !== '' &&
                state.currentAgent.tg_bot.start_message !== ''
            )
        },
        promptReady(state) {

            if (state.currentAgent.awe_agent.llm_config.prompt_preset == "") {
                return false
            }

            return !/\{|\}/.test(state.currentAgent.awe_agent.llm_config.prompt_preset)
        },
        imageReady(state) {
            if (state.currentAgent.awe_agent.image_generation_args.base_model.name === '')
                return false
            return true
        },
        paymentReady(state) {
            return (
                Number.isInteger(state.currentAgent.awe_agent.awe_token_config.user_price)
                  && state.currentAgent.awe_agent.awe_token_config.user_price >= config.min_player_payment
                && Number.isInteger(state.currentAgent.awe_agent.awe_token_config.game_pool_division)
                  && state.currentAgent.awe_agent.awe_token_config.game_pool_division >= 0
                  && state.currentAgent.awe_agent.awe_token_config.game_pool_division <= 100
                && Number.isInteger(state.currentAgent.awe_agent.awe_token_config.max_invocation_per_payment)
                  && state.currentAgent.awe_agent.awe_token_config.max_invocation_per_payment >= 0
                && Number.isInteger(state.currentAgent.awe_agent.awe_token_config.max_payment_per_round)
                  && state.currentAgent.awe_agent.awe_token_config.max_payment_per_round >= 0
            )
        },
        gamePoolReady(state) {
            return (
                Number.isInteger(state.currentAgent.awe_agent.awe_token_config.max_token_per_round)
                  && state.currentAgent.awe_agent.awe_token_config.max_token_per_round > 0
                && Number.isInteger(state.currentAgent.awe_agent.awe_token_config.max_token_per_tx)
                  && state.currentAgent.awe_agent.awe_token_config.max_token_per_tx > 0
            )
        },
    },
    actions: {
        async loadAgentData(agentId) {
            this.$state.currentAgentId = agentId

            const loadedAgentData = await userAgentAPI.getUserAgentById(agentId)
            const currentAgent = this.$state.currentAgent
            currentAgent.name = loadedAgentData.name
            currentAgent.enabled = loadedAgentData.enabled
            currentAgent.staking_amount = loadedAgentData.staking_amount
            currentAgent.created_at = loadedAgentData.created_at

            if (loadedAgentData.tg_bot) {
                Object.assign(currentAgent.tg_bot, loadedAgentData.tg_bot)
            } else {
                Object.assign(currentAgent.tg_bot, JSON.parse(JSON.stringify(emptyAgent.tg_bot)))
            }

            if (loadedAgentData.awe_agent) {
                const loadedAweAgent = loadedAgentData.awe_agent
                if (loadedAweAgent.llm_config) {
                    Object.assign(currentAgent.awe_agent.llm_config, loadedAweAgent.llm_config)
                } else {
                    Object.assign(
                        currentAgent.awe_agent.llm_config,
                        JSON.parse(JSON.stringify(emptyAgent.awe_agent.llm_config)),
                    )
                }

                this.currentAgent.awe_agent.image_generation_enabled =
                    loadedAweAgent.image_generation_enabled
                this.currentAgent.awe_agent.awe_token_enabled = loadedAweAgent.awe_token_enabled

                if (loadedAweAgent.image_generation_args) {
                    Object.assign(
                        currentAgent.awe_agent.image_generation_args,
                        loadedAweAgent.image_generation_args,
                    )
                    if (!currentAgent.awe_agent.image_generation_args.lora) {
                        currentAgent.awe_agent.image_generation_args.lora = JSON.parse(
                            JSON.stringify(emptyAgent.awe_agent.image_generation_args.lora),
                        )
                    }
                } else {
                    Object.assign(
                        currentAgent.awe_agent.image_generation_args,
                        JSON.parse(JSON.stringify(emptyAgent.awe_agent.image_generation_args)),
                    )
                }

                if (loadedAweAgent.awe_token_config) {
                    Object.assign(
                        currentAgent.awe_agent.awe_token_config,
                        loadedAweAgent.awe_token_config,
                    )
                } else {
                    Object.assign(
                        currentAgent.awe_agent.awe_token_config,
                        JSON.parse(JSON.stringify(emptyAgent.awe_agent.awe_token_config)),
                    )
                }
            } else {
                Object.assign(
                    currentAgent.awe_agent,
                    JSON.parse(JSON.stringify(emptyAgent.awe_agent)),
                )
            }
        },

        async loadAgentStats(agentId) {
            const loadedAgentStats = await userAgentAPI.getUserAgentDataById(agentId)
            Object.assign(this.currentAgentStats, loadedAgentStats)
        },

        async loadAgent(agentId) {
            await this.loadAgentData(agentId)
            await this.loadAgentStats(agentId)
        },

        validateForSave() {
            if (this.$state.currentAgent.name === '') {
                return "the Memegent's name can not be blank."
            }
            return null
        },

        validateForEnable() {
            if (this.$state.currentAgent.name === '') {
                return "the Memegent's name cannot be blank!"
            }

            if (!this.tgBotReady) {
                return 'the Telegram Bot is not fully configured!'
            }

            if (!this.promptReady) {
                return 'the Memegent Configurations is invalid!'
            }

            if (this.$state.currentAgent.awe_agent.awe_token_enabled) {
                if (!this.paymentReady) {
                    return 'the Play Fee is not fully configured!'
                }

                if (!this.gamePoolReady) {
                    return 'the Game Pool is not fully configured!'
                }
            }

            if (this.$state.currentAgent.awe_agent.image_generation_enabled) {
                if (!this.imageReady) {
                    return 'the Image Generation is not fully configured!'
                }
            }

            return null
        },

        async saveAgent() {
            const extractedAgentData = JSON.parse(JSON.stringify(this.$state.currentAgent))
            await userAgentAPI.updateUserAgent(this.$state.currentAgentId, extractedAgentData)
        },

        async terminateAgent() {
            return await userAgentAPI.terminateAgent(this.$state.currentAgentId)
        }
    },
})
