import { Fragment } from "react";
import { Route, RouteComponentProps, RouteProps } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { appConfigState } from "../../recoil/state/app-config";
import { environmentState, SHOW_ERROR_PAGE } from "../../recoil/state/environment";
import { loggedInState } from "../../recoil/state/login";
import { Error401View } from "../../views";
import { RedirectWithDest } from "./redirect-to-dest";

export const ProtectedRoute = ({ component: Component, render, ...rest }: RouteProps) => {
    const { protectedRouteBehavior } = useRecoilValue(environmentState)!;
    const loggedIn = useRecoilValue(loggedInState);
    const { login_features: { login_enabled: loginEnabled } } = useRecoilValue(appConfigState)!;
    // if (!loggedIn) {
    //     if (protectedRouteBehavior === SHOW_ERROR_PAGE) return (
    //         <Error401View/>
    //     ); else return <RedirectWithDest to="/login"/>;
    // }
    // console.log(loggedIn);
    return (
        <Route
            {...rest}
            render={(props: RouteComponentProps) => {
                if (loggedIn === null) {
                } else if (loggedIn) {
                    if (Component) return <Component {...props}/>;
                    else return render!(props);
                } else if (loginEnabled === false || protectedRouteBehavior === SHOW_ERROR_PAGE) {
                    return <Error401View/>;
                } else {
                    return <RedirectWithDest to="/login"/>;
                }
            }}
        />
    );
};