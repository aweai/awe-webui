import BaseApi from "../base-api";

class UserWalletAPI extends BaseApi {
    async bindWallet(agentId, tgUserId, walletAddress, timestamp, walletSignature, commSignature) {
        return this.getHttpClient().post("/user-wallets/bind/" + agentId + "/" + tgUserId
             + "?wallet_address=" + walletAddress
             + "&timestamp=" + timestamp
             + "&wallet_signature=" + walletSignature
             + "&comm_signature=" + commSignature
        )
    }

    async approve(agentId, tgUserId) {

    }
}

const userWalletAPI = new UserWalletAPI()

export default userWalletAPI