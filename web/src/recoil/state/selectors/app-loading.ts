import { selector } from "recoil";
import { appConfigState } from "../app-config";
import { environmentState } from "../environment";

export const appLoadingState = selector<boolean>({
    key: 'AppLoading',
    get: ({ get }) => {
        const appConfig = get(appConfigState);
        const environment = get(environmentState);
        return (
            appConfig === null ||
            environment === null
        );
    }
});