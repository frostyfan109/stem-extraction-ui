import { QqSquareFilled } from "@ant-design/icons";
import { Link, LinkProps, Redirect, RedirectProps, useLocation } from "react-router-dom";

interface RedirectToDestProps {
    defaultDest?: string
}

export const LinkWithRedirect = ({ to, children, ...other }: LinkProps) => {
    const qs = new URLSearchParams(to.toString().split("?")[1]);
    qs.set("dest", window.location.href.split(window.location.origin)[1]);
    const toWithRedirect = to.toString().split("?")[0] + "?" + qs.toString();
    return (
        <Link to={toWithRedirect} {...other}>{children}</Link>
    );
};

// Redirect and store the previous URL in qs as `dest` to redirect back later.
export const RedirectWithDest = ({ to, ...other }: RedirectProps) => {
    const qs = new URLSearchParams(to.toString().split("?")[1]);
    qs.set("dest", window.location.href.split(window.location.origin)[1]);
    const toWithRedirect = to.toString().split("?")[0] + "?" + qs.toString();
    return (
        <Redirect to={toWithRedirect} {...other}/>
    );
};

// Redirect back to `dest` in qs.
export const RedirectToDest = ({ defaultDest="/" }: RedirectToDestProps) => {
    const location = useLocation();
    const qs = new URLSearchParams(location.search);
    const dest = qs.get("dest") || defaultDest;
    return (
        <Redirect to={dest}/>
    );
};