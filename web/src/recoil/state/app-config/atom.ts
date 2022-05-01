import { atom } from "recoil";
import { AppConfig } from "../../../api";
import { localStorageEffect } from "../../effects";

export const appConfigState = atom<AppConfig|null>({
    key: 'AppConfig',
    default: null,
    effects: [
        // localStorageEffect<AppConfig|null>('app_config')
    ]
});