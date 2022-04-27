import _axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import deepmerge from "deepmerge";
import { CustomError } from "ts-custom-error";

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
interface SuccessfulAPIResponse extends BaseApiResponse {
    data: any
}
interface FailedAPIResponse extends BaseApiResponse {
    // `message` and `error_info` are both expected to be defined when `error` is true.
    message: string,
    error: true,
    error_info: ErrorInfo
}
type APIResponse = SuccessfulAPIResponse | FailedAPIResponse;

export class APIError extends CustomError {
    constructor(
        public response: FailedAPIResponse,
        public axiosError: AxiosError
    ) {
        super(response.message);
    }
}
/** If the request fails to go through to the server. */
export class APIRequestError extends APIError {
    constructor(error: AxiosError) {
        super({
            message: "API request error",
            error: true,
            error_info: { traceback: error.stack! },
            status_code: null
        }, error);
    }
}
/** If the request goes through and gets a response, but the server returns a bad status code. */
export class APIResponseError extends APIError {}

export abstract class IApi {
    abstract getAppConfig(fetchOptions?: AxiosRequestConfig): Promise<SuccessfulAPIResponse>
    abstract getUserHistory(fetchOptions?: AxiosRequestConfig): Promise<SuccessfulAPIResponse>
    abstract login(
        username: string,
        password: string,
        rememberMe: boolean,
        fetchOptions?: AxiosRequestConfig
    ): Promise<SuccessfulAPIResponse>
    abstract register(
        username: string,
        email: string,
        password: string,
        rememberMe: boolean,
        fetchOptions?: AxiosRequestConfig
    ): Promise<SuccessfulAPIResponse>
    abstract logout(fetchOptions?: AxiosRequestConfig): Promise<SuccessfulAPIResponse>
}

interface APIV1Options {
    apiUrl: string
    globalConfig?: AxiosRequestConfig
}
/* The API is state-independent and therefore does not know if
 * the requests are authenticated or not (i.e. logged in, etc.).
 */
export class ApiV1 extends IApi {
    private axios: AxiosInstance;
    constructor({ apiUrl, globalConfig={} }: APIV1Options) {
        super();
        this.axios = _axios.create(deepmerge(
            globalConfig,
            {
                baseURL: apiUrl,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"  
                }
            }
        ));
    }
    @APIRequest()
    async getAppConfig(fetchOptions: AxiosRequestConfig) {
        const res = await this.axios.get("/config/app", {
            ...fetchOptions
        });
        return res.data;
    }
    @APIRequest()
    async getUserHistory(fetchOptions: AxiosRequestConfig) {
        const res = await this.axios.get( "/user/history", {
            ...fetchOptions
        });
        return res.data;
    }
    @APIRequest()
    async login(username: string, password: string, remember_me=false, fetchOptions: AxiosRequestConfig) {
        const res = await this.axios.post("/user/login", {
            username,
            password,
            remember_me
        }, {
            ...fetchOptions
        });
        return res.data;
    }
    @APIRequest()
    async register(username: string, email: string, password: string, remember_me=false, fetchOptions: AxiosRequestConfig) {
        const res = await this.axios.post("/user/register", {
            username,
            email,
            password,
            remember_me
        }, {
            ...fetchOptions
        });
        return res.data;
    }
    @APIRequest()
    async logout(fetchOptions: AxiosRequestConfig) {
        const res = await this.axios.post("/user/logout", {}, {
            ...fetchOptions
        });
        return res.data;
    }
}
function APIRequest(): Function {
    return (target: IApi, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        const method = descriptor.value;
        descriptor.value = async function(this: IApi, ...args: any[]) {
            try {
                return await method.apply(this, args);
            } catch (e: any) {
                if (e.isAxiosError) {
                    if (!e.response) {
                        // Request failed to go through (e.g. ECONNREFUSED).
                        throw new APIRequestError(e);
                    } else {
                        // The request went through and got a response.
                        throw new APIResponseError(e.response.data, e);
                    }
                } else {
                    throw e;
                }
            }
        };
        return descriptor;
    };
}