import ApiError from './api-error'
import v1Client from './v1/v1'

class BaseApi {
    constructor() {
        this.ErrorType = ApiError.Type
        this.httpClient = v1Client
    }

    setHttpClient(client) {
        this.httpClient = client
    }

    getHttpClient() {
        return this.httpClient
    }
}

export default BaseApi
