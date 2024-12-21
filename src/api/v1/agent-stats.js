import BaseApi from "../base-api";

class AgentStatsAPI extends BaseApi {
    getDailyInvocations(agent_id) {
        return this.getHttpClient().get("/agent-stats/" + agent_id + "/invocations")
    }
    getDailyTransfers(agent_id) {
        return this.getHttpClient().get("/agent-stats/" + agent_id + "/token-transfers")
    }
}

const agentStatsAPI = new AgentStatsAPI()

export default agentStatsAPI
