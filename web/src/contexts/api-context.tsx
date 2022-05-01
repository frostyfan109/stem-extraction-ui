import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { APICallbacks, APIError, ApiV1, IApi } from '../api';
import { appConfigState } from '../recoil/state/app-config';
import { environmentState } from '../recoil/state/environment';
import { loggedInState } from '../recoil/state/login';
import { appLoadingState } from '../recoil/state/selectors';
import { useError } from './error-context';

export const ApiContext = createContext<IApi|null>(null);

export const ApiProvider = ({ children }: any) => {
    const { handleApiError } = useError();
    const [api, setApi] = useState<IApi|null>(null);
    const environment = useRecoilValue(environmentState);
    const appConfig = useRecoilValue(appConfigState);
    const appLoading = useRecoilValue(appLoadingState);
    const setLoggedIn = useSetRecoilState(loggedInState);

    const apiUrl = useMemo(() => environment?.apiUrl, [environment]);

    const callbacks: APICallbacks = useMemo(() => ({
        onLogout: () => {
            console.log("do logout");
            setLoggedIn(false);
        },
        handleApiError: (error) => handleApiError({ error })
    }), [handleApiError, setLoggedIn]);
    useEffect(() => {
        if (apiUrl) {
            const _api = new ApiV1({
                apiUrl,
                callbacks
            });
            setApi(_api);
        } else setApi(null);
    }, [apiUrl]);
    useEffect(() => {
        if (api && !appLoading) {
            if (appConfig?.login_features.login_enabled) setLoggedIn(api.authenticated);
        }
    }, [api, appLoading]);
    useEffect(() => {
        if (api) api.updateCallbacks(callbacks);
    }, [api, callbacks]);
    return (
        <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);