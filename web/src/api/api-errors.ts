import { AxiosError } from "axios";
import { CustomError } from "ts-custom-error";
import { FailedAPIResponse } from "./api";

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

/* Response-handling errors */
export interface ThrownAPIError {
    status_code: number
}
export const Throws404: ThrownAPIError = {
    status_code: 404
};
export const Throws401: ThrownAPIError = {
    status_code: 401
};
export const Throws400: ThrownAPIError = {
    status_code: 400
};