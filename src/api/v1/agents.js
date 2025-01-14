import BaseApi from "../base-api";

class AgentsAPI extends BaseApi {
    async getAgents(listType, page) {
        return this.getHttpClient().get("/agents?list=" + listType + "&page=" + page)
    }
}

const agentsAPI = new AgentsAPI()

export default agentsAPI
