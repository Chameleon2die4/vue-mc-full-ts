import { AxiosResponse } from 'axios'
import { ICustomResponse, IResponseData } from './types'

export class Response implements ICustomResponse {
    constructor(public response: AxiosResponse) {}

    getData(): IResponseData {
        return this.response.data
    }

    getStatus(): number {
        return this.response.status
    }

    getHeaders(): any {
        return this.response.headers
    }

    getValidationErrors(): any[] {
        return []
    }
}
