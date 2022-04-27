import { createContext, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import * as H from "history";

interface DestRedirect {
    redirectWithDest: (to: H.LocationDescriptor) => void,
    redirectToDest: (defaultDest?: string) => void
}

export const DestRedirectContext = createContext<DestRedirect>({} as DestRedirect);

export const DestRedirectProvider = ({ children }: any) => {
    const location = useLocation();
    const history = useHistory();
    const redirectWithDest = (to: H.LocationDescriptor) => {
        const qs = new URLSearchParams(to.toString().split("?")[1]);
        qs.set("dest", window.location.href.split(window.location.origin)[1]);
        const toWithRedirect = to.toString().split("?")[0] + "?" + qs.toString();
        history.push(toWithRedirect);
    };
    const redirectToDest = (defaultDest="/") => {
        const qs = new URLSearchParams(location.search);
        const dest = qs.get("dest") || defaultDest;
        history.push(dest);
    };
    return (
        <DestRedirectContext.Provider value={{
            redirectWithDest,
            redirectToDest
        }}>
            {children}
        </DestRedirectContext.Provider>
    );
};

export const useDest = () => useContext(DestRedirectContext);