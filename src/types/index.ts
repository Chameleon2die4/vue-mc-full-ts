import { AxiosResponse } from 'axios';

export interface IResponseData {
  [key: string]: any;
}

export interface ICustomResponse<T = IResponseData> {
  response: AxiosResponse;
  getData(): T;
  getStatus(): number;
  getHeaders(): any;
  getValidationErrors(): any[];
}

export interface IRequestConfig {
  method?: string;
  url?: string;
  data?: any;
  headers?: any;
  params?: any;
  [key: string]: any;
}

export interface IRequestOptions {
  /**
   * HTTP method for the request
   */
  method?: string;

  /**
   * URL for the request
   */
  url?: string;

  /**
   * Data to be sent as the request body
   */
  data?: Record<string, any>;

  /**
   * Query parameters to be added to the URL
   */
  params?: Record<string, any>;

  /**
   * Request headers
   */
  headers?: Record<string, any>;
}

export interface IRequestError extends Error {
  error: Error;
  response?: ICustomResponse;
  getError(): Error;
  getResponse(): ICustomResponse | undefined;
}

export interface IResponseError extends Error {
  response: ICustomResponse;
  getResponse(): ICustomResponse;
}

export type Routes = Record<'fetch' | 'save' | 'delete' | string, string>;

export interface IBaseOptions {
    http: any | null;
    autoCatch: boolean;
    autoSave: boolean;
    autoValidate: boolean;
    validateOnChange: boolean;
    [key: string]: any;
}

export interface IModelOptions extends IBaseOptions {
    // Model-specific options
    methods: {
        fetch: string;
        save: string;
        update: string;
        create: string;
        delete: string;
        patch: string;
    };
    routeParameterName: string;
    useFirstErrorOnly: boolean;
    patch: boolean;
    validationErrorStatus: number;
}

export interface ICollectionOptions extends IBaseOptions {
    // Collection-specific options
    methods: {
        fetch: string;
    };
    queryParameter: string;
    pageParameter: string;
    perPageParameter: string;
    sortParameter: string;
    sortDirectionParameter: string;
    filterParameter: string;
    searchParameter: string;
    delimiter: string;
}
