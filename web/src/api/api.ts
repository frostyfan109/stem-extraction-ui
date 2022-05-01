import { AxiosRequestConfig } from "axios";
import { APIError, APIRequestError, APIResponseError, ThrownAPIError } from "./api-errors";
import { AppConfigResponse, HistoryResponse, LoginResponse, LogoutResponse, RegisterResponse } from "./api-responses";

interface ErrorInfo {
    // The API only attaches tracebacks to internal server errors.
    traceback?: string
}
/* The standard response format of the API. */
interface BaseApiResponse {
    message?: string,
    data?: any,
    status_code: number|null
}
export interface SuccessfulAPIResponse<T> extends BaseApiResponse {
    data: T
}
export interface FailedAPIResponse extends BaseApiResponse {
    // `message` and `error_info` are both expected to be defined when `error` is true.
    message: string,
    error: true,
    error_info: ErrorInfo
}

export interface APICallbacks {
    onLogout?: (error: APIResponseError) => void,
    handleApiError?: (error: APIError) => void
}

export abstract class IApi {
    protected onLogout!: (error: APIResponseError) => void;
    protected handleApiError!: (error: APIError) => void;
    constructor(callbacks: APICallbacks) {
        this.updateCallbacks(callbacks);
    }
    public updateCallbacks(callbacks: APICallbacks) {
        this.onLogout = callbacks.onLogout || (() => {});
        this.handleApiError = callbacks.handleApiError || (() => {});
    }

    abstract get authenticated(): boolean;
    protected abstract handleError(error: APIError): void;
    abstract getAppConfig(fetchOptions?: AxiosRequestConfig): Promise<AppConfigResponse>
    abstract getUserHistory(fetchOptions?: AxiosRequestConfig): Promise<HistoryResponse>
    abstract login(
        username: string,
        password: string,
        rememberMe: boolean,
        fetchOptions?: AxiosRequestConfig
    ): Promise<LoginResponse>
    abstract register(
        username: string,
        email: string,
        password: string,
        rememberMe: boolean,
        fetchOptions?: AxiosRequestConfig
    ): Promise<RegisterResponse>
    abstract logout(fetchOptions?: AxiosRequestConfig): Promise<LogoutResponse>
}
export function APIRequest(...acceptableErrors: ThrownAPIError[]): Function {
    return (target: IApi, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor.value;
        descriptor.value = async function(this: IApi, ...args: any[]) {
            try {
                return await method.apply(this, args);
            } catch (e: any) {
                if (e.isAxiosError) {
                    if (!e.response) {
                        // Request failed to go through (e.g. ECONNREFUSED).
                        const err = new APIRequestError(e);
                        this.handleError(err);
                        throw err;
                    } else {
                        const isErrorAcceptable = acceptableErrors.some((err) => (
                            err.status_code === e.response.data.status_code
                        ));
                        const err = new APIResponseError(e.response.data, e);
                        if (!isErrorAcceptable) {
                            console.log("error not acceptable", e.config.url, e.response.data.status_code);
                            // The request went through and got a response.
                            this.handleError(err);
                        }
                        throw err;
                    }
                } else {
                    throw e;
                }
            }
        };
        return descriptor;
    };
}