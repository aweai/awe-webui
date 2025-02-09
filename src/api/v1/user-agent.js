import BaseApi from "../base-api";

class UserAgentAPI extends BaseApi {
    async getUserAgents() {
        return this.getHttpClient().get("/user-agents")
    }

    async getUserAgentById(id) {
        return this.getHttpClient().get("/user-agents/" + id)
    }

    async getUserAgentDataById(id) {
        return this.getHttpClient().get("/user-agents/" + id + "/data")
    }

    async getUserAgentEmissionHistory(id) {
        return this.getHttpClient().get("/user-agents/" + id + "/stats/emission")
    }

    async getUserAgentUsesrHistory(id) {
        return this.getHttpClient().get("/user-agents/" + id + "/stats/users")
    }

    async getUserAgentInvocationsHistory(id) {
        return this.getHttpClient().get("/user-agents/" + id + "/stats/invocations")
    }

    async importUserAgents() {
        return this.getHttpClient().post("/user-agents")
    }

    async updateUserAgent(id, userAgentData) {
        return this.getHttpClient().put("/user-agents/" + id, userAgentData)
    }

    async resetAgentRound(id) {
        return this.getHttpClient().post("/user-agents/" + id + "/round")
    }

    async chargeGamePool(id, amount, approveTx) {
        return this.getHttpClient().post("/user-agents/" + id + "/game-pool?amount="+amount + "&tx=" + approveTx)
    }

    async withdraw(id, amount) {
        return this.getHttpClient().post("/user-agents/" + id + "/account?amount="+amount)
    }

    async getPFP(agent_id) {
        try {
            const response = await fetch(this.getHttpClient().getBaseURL() + "/pfps/" + agent_id + ".png")

            if (!response.ok) {

                // If the image URL returns 404, return an empty string
                if (response.status === 404) {
                    return ''
                }

                throw new Error('Image loading failed with status: ' + response.status)
            }

            const blob = await response.blob()
            return await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

        } catch (error) {
            console.error(error)
            throw new Error('Failed loading image')
        }
    }

    async uploadPFP(agent_id, file) {
        const form = new FormData()
        form.append('file', file)
        return this.getHttpClient().post("/user-agents/" + agent_id + "/pfp", form)
    }

    async terminateAgent(agent_id) {
        return this.getHttpClient().delete("/user-agents/" + agent_id)
    }
}

const userAgentAPI = new UserAgentAPI()

export default userAgentAPI
