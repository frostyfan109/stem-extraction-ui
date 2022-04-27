import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { appConfigState } from '../../recoil/state/app-config';
import { appLoadingState } from '../../recoil/state/selectors';
import './source-separation.css';

export const SourceSeparationView = () => {
    const appConfig = useRecoilValue(appConfigState);
    const loading = useRecoilValue(appLoadingState);
    return (
        <Fragment>
            {JSON.stringify(appConfig)}
            {JSON.stringify(loading)}
        </Fragment>
    );
};