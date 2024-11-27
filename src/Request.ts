import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { IRequestConfig, ICustomResponse } from './types';
import { Response } from './Response';
import { RequestError } from './errors/RequestError';

export class Request {
    protected config: AxiosRequestConfig;

    constructor(config: IRequestConfig = {}) {
        this.config = config as AxiosRequestConfig;
    }

    protected createResponse(axiosResponse: AxiosResponse): Response {
        return new Response(axiosResponse);
    }

    protected createError(axiosError: AxiosError): RequestError {
        return new RequestError(axiosError, axiosError.response ? this.createResponse(axiosError.response) : undefined);
    }

    send(): Promise<ICustomResponse> {
        return axios
            .request(this.config)
            .then(response => this.createResponse(response))
            .catch(error => {
                throw this.createError(error);
            });
    }
}
