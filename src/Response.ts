import { AxiosResponse } from 'axios'
import { ICustomResponse, IResponseData } from './types'

export class Response<T = IResponseData> implements ICustomResponse<T> {
    constructor(public response: AxiosResponse) {}

    getData(): T {
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
