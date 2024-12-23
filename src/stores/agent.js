import { defineStore } from 'pinia'
import userAgentAPI from '@/api/v1/user-agent'

const emptyAgent = {
  name: '',
  enabled: false,
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
    awe_token_enabled: false,
    awe_token_config: {
      max_token_per_tx: 10,
      max_token_per_round: 100,
    },
    image_generation_enabled: false,
    image_generation_args: {
      version: '2.0.0',
      prompt: '',
      base_model: {
        name: '',
        variant: null,
      },
      lora: {
        model: '',
        weight_file_name: '',
        weight: 100,
      },
      task_config: {
        num_images: 1,
        steps: 40,
        cfg: 3.5,
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
      awe_token_quote: 0,
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
            (this.maxQuoteThisRound + state.currentAgentStats.awe_token_round_transferred),
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
      return state.currentAgent.awe_agent.llm_config.prompt_preset !== ''
    },
    imageReady(state) {
      if (state.currentAgent.awe_agent.image_generation_args.base_model.name === '') return false
      return true
    },
    tokenReady(state) {
      return (
        state.currentAgent.awe_agent.awe_token_config.max_token_per_round > 0 &&
        state.currentAgent.awe_agent.awe_token_config.max_token_per_tx > 0
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

      if (loadedAgentData.tg_bot) {
        Object.assign(currentAgent.tg_bot, loadedAgentData.tg_bot)
      } else {
        Object.assign(currentAgent.tg_bot, {
          username: '',
          token: '',
          start_message: '',
        })
      }

      if (loadedAgentData.awe_agent) {
        const loadedAweAgent = loadedAgentData.awe_agent
        if (loadedAweAgent.llm_config) {
          Object.assign(currentAgent.awe_agent.llm_config, loadedAweAgent.llm_config)
        } else {
          Object.assign(currentAgent.awe_agent.llm_config, {
            model_name: 'mistralai/Mistral-7B-Instruct-v0.3',
            hf_token: '',
            prompt_preset: '',
          })
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
            currentAgent.awe_agent.image_generation_args.lora = {
              model: '',
              weight_file_name: '',
              weight: 100,
            }
          }
        } else {
          Object.assign(currentAgent.awe_agent.image_generation_args, {
            version: '2.0.0',
            prompt: '',
            base_model: {
              name: '',
              variant: null,
            },
            lora: {
              model: '',
              weight_file_name: '',
              weight: 100,
            },
            task_config: {
              num_images: 1,
              steps: 40,
              cfg: 3.5,
              safety_checker: false,
            },
          })
        }

        if (loadedAweAgent.awe_token_config) {
          Object.assign(currentAgent.awe_agent.awe_token_config, loadedAweAgent.awe_token_config)
        } else {
          Object.assign(currentAgent.awe_agent.awe_token_config, {
            max_token_per_tx: 10,
            max_token_per_round: 100,
          })
        }
      } else {
        Object.assign(currentAgent.awe_agent, {
          llm_config: {
            model_name: 'mistralai/Mistral-7B-Instruct-v0.3',
            hf_token: '',
            prompt_preset: '',
          },
          awe_token_enabled: false,
          awe_token_config: {
            max_token_per_tx: 10,
            max_token_per_round: 100,
          },
          image_generation_enabled: false,
          image_generation_args: {
            version: '2.0.0',
            prompt: '',
            base_model: {
              name: '',
              variant: null,
            },
            lora: {
              model: '',
              weight_file_name: '',
              weight: 100,
            },
            task_config: {
              num_images: 1,
              steps: 40,
              cfg: 3.5,
              safety_checker: false,
            },
          },
        })
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
        return 'the Characteristics of Memegent cannot be blank!'
      }

      if (this.$state.currentAgent.awe_agent.awe_token_enabled) {
        if (!this.tokenReady) {
          return 'the Token Distribution is not fully configured!'
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
  },
})
