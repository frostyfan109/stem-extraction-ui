import _axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import deepmerge from "deepmerge";
import Cookies from "js-cookie";
import JwtDecode, { JwtPayload } from "jwt-decode";
import { APICallbacks, APIRequest, IApi } from "./api";
import { APIError, APIRequestError, Throws400, Throws401 } from "./api-errors";

interface APIV1Options {
    apiUrl: string,
    globalConfig?: AxiosRequestConfig,
    callbacks: APICallbacks
}
/* The API is state-independent and therefore does not know if
 * the requests are authenticated or not (i.e. logged in, etc.).
 */
export class ApiV1 extends IApi {
    private axios: AxiosInstance;
    constructor({
        apiUrl,
        globalConfig={},
        callbacks={}
    }: APIV1Options) {
        super(callbacks);
        this.axios = _axios.create(deepmerge(
            globalConfig,
            {
                baseURL: apiUrl,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"  
                },
                withCredentials: true
            }
        ));
        this.axios.interceptors.request.use(
            (config) => {
                if (!config.headers) config.headers = {};
                if (this.accessToken) {
                    config.headers["Authorization"] = "Bearer " + this.accessToken;
                }
                return config;
            }
        );
        this.axios.interceptors.response.use(
            (response) => {
                this.updateJWT(response);
                return response;
            },
            (error) => {
                if (error.response) {
                    this.updateJWT(error.response);
                }
                throw error;
            }
        );
    }
    get authenticated(): boolean {
        return this.refreshToken !== undefined;
    }
    get accessToken(): string | undefined {
        return Cookies.get("access_token");
    }
    set accessToken(token: string | undefined) {
        if (token === undefined) {
            Cookies.remove("access_token");
        } else {
            Cookies.set("access_token", token);
        }
    }
    get refreshToken(): string | undefined {
        return Cookies.get("refresh_token");
    }
    set refreshToken(token: string | undefined) {
        if (token === undefined) {
            Cookies.remove("refresh_token");
        } else {
            Cookies.set("refresh_token", token);
        }
    }
    updateJWT(response: AxiosResponse) {
        const accessToken = response.headers["x-set-access-token"];
        const refreshToken = response.headers["x-set-refresh-token"];
        const clearAccessToken = response.headers["x-clear-access-token"];
        const clearRefreshToken = response.headers["x-clear-refresh-token"];
        if (accessToken) {
            this.accessToken = accessToken;
        }
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
        if (clearAccessToken === "true") {
            this.accessToken = undefined;
        }
        if (clearRefreshToken === "true") {
            this.accessToken = undefined;
            this.refreshToken = undefined;
        }
    }
    // Handle unanticipated errors thrown by @APIRequest methods.
    // An API request that receives an anticipated error (e.g. a 401 from /login)
    // will still return this error, but it will not be passed to `handleError`.
    handleError(error: APIError) {
        if (error instanceof APIRequestError) {
            console.log("Show error modal");
            console.log(this.handleApiError);
            (window as any).x = this.handleApiError;
            this.handleApiError(error);
        } else {
            if (error.response.status_code === 401) {
                this.onLogout(error);
            } else {
                this.handleApiError(error);
            }
        }
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
    @APIRequest(Throws401)
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
    @APIRequest(Throws400)
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