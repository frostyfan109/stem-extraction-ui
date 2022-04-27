import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ApiV1, IApi } from '../api';
import { environmentState } from '../recoil/state/environment';
import { loggedInState } from '../recoil/state/login';
import { useError } from './error-context';

export const ApiContext = createContext<IApi|null>(null);

export const ApiProvider = ({ children }: any) => {
    const [api, setApi] = useState<IApi|null>(null);
    const environment = useRecoilValue(environmentState);
    const setLoggedIn = useSetRecoilState(loggedInState);

    const apiUrl = useMemo(() => environment?.apiUrl, [environment]);

    useEffect(() => {
        if (apiUrl) setApi(new ApiV1({ apiUrl: apiUrl }));
        else setApi(null);
    }, [apiUrl]);
    return (
        <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);