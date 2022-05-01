import { atom } from "recoil";
import Cookies from "js-cookie";

export const loggedInState = atom<boolean|null>({
    key: 'LoggedIn',
    default: null
});