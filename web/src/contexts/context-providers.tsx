import { Fragment } from 'react';
import { ApiProvider } from './api-context';
import { DestRedirectProvider } from './dest-redirect-context';
import { ErrorProvider } from './error-context';
import { LoadingProvider } from './loading-context';

export const ContextProviders = ({ children }: any) => (
    <Fragment>
        <ErrorProvider>
            <ApiProvider>
                <DestRedirectProvider>
                    <LoadingProvider>
                        {children}
                    </LoadingProvider>
                </DestRedirectProvider>
            </ApiProvider>
        </ErrorProvider>
    </Fragment>
  );