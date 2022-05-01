import React, { createContext, Fragment, useContext, useEffect, useState } from 'react';
import { Typography, Button, Modal, ModalFuncProps, Space, Divider } from 'antd';
import { AxiosError } from 'axios';
import { ErrorContent, ErrorTitle } from './error-modal';
import { APIError, APIRequestError } from '../../api';

const { Paragraph, Text } = Typography;

interface ModalRef {
    destroy: Function,
    update: Function
}

export interface ErrorHandler {
    handleError: (options: HandleErrorOptions) => void,
    handleWarning: (options: HandleWarningOptions) => void,
    handleUncaughtError: (options: HandleUncaughtErrorOptions) => void,
    handleApiError: (options: HandleUncaughtAPIErrorOptions) => void
}

export enum ErrorSeverity {
    WARNING,
    ERROR
} 

interface HandleErrorOptions {
    errorName: string,
    errorDescription?: React.ReactNode,
    errorInfo?: React.ReactNode,
    advancedErrorInfo?: React.ReactNode,
    // Is `advancedErrorInfo` a traceback
    traceback?: boolean,
    severity?: ErrorSeverity,
    extra?: ModalFuncProps,
}

type HandleWarningOptions = Omit<HandleErrorOptions, "severity">

type HandleUncaughtErrorOptions = Partial<HandleErrorOptions> & {
    error: Error
}

type HandleUncaughtAPIErrorOptions = Partial<HandleErrorOptions> & {
    // If a non AxiosError is given as `error`, it will fallback to `handleUncaughtError`.
    error: APIError | Error
}

export const ErrorContext = createContext<ErrorHandler>({} as ErrorHandler);

export const ErrorProvider = ({ children }: any) => {
    const [errorModals, setErrorModals] = useState<ModalRef[]>([]);
    const [context, setContext] = useState<ErrorHandler>({} as ErrorHandler);
    useEffect(() => {
        const handleError = ({
            errorName,
            errorDescription,
            errorInfo,
            advancedErrorInfo,
            traceback=true,
            severity=ErrorSeverity.ERROR,
            extra={}
        } : HandleErrorOptions) => {
            const title = <ErrorTitle name={errorName} description={errorDescription}/>;
            const content = <ErrorContent info={errorInfo} advanced={advancedErrorInfo} traceback={traceback}/>;
            let func;
            switch (severity) {
                case ErrorSeverity.ERROR:
                    func = Modal.error;
                    break;
                case ErrorSeverity.WARNING:
                    func = Modal.warning;
                    break;
                default:
                    func = Modal.error;
                    break;
            }
            const modal = func({
                title,
                content,
                width: 500,
                okText: "OK",
                ...extra
            });
            setErrorModals([...errorModals, modal]);
        };
        const handleWarning = (options: HandleWarningOptions) => {
            return handleError({
                severity: ErrorSeverity.WARNING,
                ...options
            });
        };
        // As in an error that is not otherwise handled or is unknown as to why it occured.
        // Log the error and auto-generate any unprovided handleError args.
        const handleUncaughtError = ({error, errorName, errorInfo, advancedErrorInfo, severity=ErrorSeverity.ERROR, ...other }: HandleUncaughtErrorOptions) => {
            if (severity === ErrorSeverity.ERROR) console.error(error);
            return handleError({
                errorName: errorName || "Something went wrong.",
                errorInfo: errorInfo || error.message,
                advancedErrorInfo: advancedErrorInfo || error.stack,
                ...other
            });
        };
        const handleApiError = ({ error, severity=ErrorSeverity.ERROR, ...other }: HandleUncaughtAPIErrorOptions) => {
            if (error instanceof APIError) {
                const { config, response } = error.axiosError;
                const apiResponse = error.response;
                let name, message, traceback;
                if (error instanceof APIRequestError) {
                    // The request failed to connect to the server (e.g. connection was refused, reset, etc.)
                    name = "Network error";
                    message = "Could not establish a connection to the service.";
                    traceback = new Error().stack;
                } else {
                    // The request was successful but the server sent returned a bad status code.
                    let statusText = response!.statusText.toLowerCase();
                    statusText = statusText[0].toUpperCase() + statusText.slice(1);
                    
                    name = `${response!.status} ${statusText}`;
                    message = apiResponse.message;
                    traceback = apiResponse.error_info?.traceback || new Error().stack;
                }
                if (severity === ErrorSeverity.ERROR) console.error(error);
                return handleError({
                    errorName: name,
                    errorDescription: `Failed to ${config.method?.toUpperCase()} ${config.url}.`,
                    errorInfo: message,
                    advancedErrorInfo: traceback,
                    traceback: true
                });
            } else {
                // Problem with actual code, not the server.
                return handleUncaughtError({ error, ...other });
            }
        };
        setContext({
            handleError,
            handleWarning,
            handleUncaughtError,
            handleApiError
        });
    }, []);

    return (
        <ErrorContext.Provider value={context}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => useContext(ErrorContext);