import { Fragment } from 'react';
import { ApiProvider } from './api-context';
import { DestRedirectProvider } from './dest-redirect-context';
import { ErrorProvider } from './error-context';

export const ContextProviders = ({ children }: any) => (
    <Fragment>
        <ErrorProvider>
            <ApiProvider>
                <DestRedirectProvider>
                    {children}
                </DestRedirectProvider>
            </ApiProvider>
        </ErrorProvider>
    </Fragment>
  );