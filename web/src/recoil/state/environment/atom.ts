import { atom } from "recoil";

type LOGIN_REDIRECT = "login_redirect";
type SHOW_ERROR_PAGE = "show_error";
export type ProtectedRouteBehavior = LOGIN_REDIRECT | SHOW_ERROR_PAGE;
export const LOGIN_REDIRECT = "login_redirect";
export const SHOW_ERROR_PAGE = "show_error";

type POPUP = "true";
type SHOW_PAGE = "false";
export type LoginPopupBehavior = POPUP | SHOW_PAGE;
export const POPUP = "true";
export const SHOW_PAGE = "false";

interface Environment {
    protectedRouteBehavior: ProtectedRouteBehavior,
    loginPopupBehavior: LoginPopupBehavior,
    apiUrl: string,
    loginEnabled: boolean,
    googleToken: string | null,
    appleToken: string | null
}

export const environmentState = atom<Environment|null>({
    key: 'Environment',
    default: null
});