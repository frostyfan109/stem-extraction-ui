import { Fragment } from "react";
import { Redirect } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { environmentState } from "../../recoil/state/environment";
import { loggedInState } from "../../recoil/state/login";

export const HomeView = ({}) => {
    const loggedIn = useRecoilValue(loggedInState);
    
    return (
        <Fragment>
            Home
        </Fragment>
    );
};