import { CustomError } from "ts-custom-error";

interface EnvironmentErrorData {
    envName: string,
    envValue: string|undefined,
    allowedValues?: any[],
    required: boolean
}

export class EnvironmentError extends CustomError {
    constructor(
        public data: EnvironmentErrorData,
        public message=`Environment error: ${data.envName}=${data.envValue}`,
    ) {
        super(message);
    }
}
export class UnrecognizedVarError extends EnvironmentError {
    constructor(public data: EnvironmentErrorData) {
        super(data);
    }
}

export const loadEnvironmentValue = (
    envKey: string,
    allowedValues?: any[],
    required: boolean = true,
    parser: (value: string|undefined) => any = (value) => value
) => {
    const envValue = parser(process.env[envKey]);
    let isAllowed = (
        allowedValues === undefined || allowedValues.some((val) => val === envValue)
    );
    if (required && envValue === undefined) isAllowed = false;
    if (isAllowed) {
        return envValue;
    } else {
        throw new UnrecognizedVarError({
            envName: envKey,
            envValue,
            allowedValues,
            required
        });
    }
};