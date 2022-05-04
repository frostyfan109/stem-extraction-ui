import { createContext, useContext, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { appConfigState } from "../recoil/state/app-config";
import { environmentState } from "../recoil/state/environment";
import { useApi } from "./api-context";
import { useError } from "./error-context";

interface ILoadingContext {
    loading: boolean,
    appStateLoading: boolean
}

export const LoadingContext = createContext<ILoadingContext>({
    loading: true,
    appStateLoading: true
});

export const LoadingProvider = ({ children }: any) => {
    const api = useApi();
    const errorHandler = useError();
    const environment = useRecoilValue(environmentState);
    const appConfig = useRecoilValue(appConfigState);

    const loading = useMemo(() => (
        environment === null ||
        api === null ||
        errorHandler === null
    ), [environment, api, errorHandler]);

    const appStateLoading = useMemo(() => (
        loading ||
        appConfig === null
    ), [loading, appConfig]);

    return (
        <LoadingContext.Provider value={{
            loading,
            appStateLoading
        }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);