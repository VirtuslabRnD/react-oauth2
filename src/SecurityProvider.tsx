import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import KeycloakAdapter, { KeycloakAuthConfig } from './auth/KeycloakAdapter';
import { ErrorComponentProps, SecurityContext, SecurityContextValue } from './SecurityContext';

export type SecurityProviderProps = Readonly<KeycloakAuthConfig> & {
  readonly children: ReactNode;
  // todo use <Suspense> + <ErrorBoundary> some day instead...
  readonly fallback: SecurityContextValue['fallbackComponent'];
  readonly error: SecurityContextValue['errorComponent'];
};

function SecurityProvider(props: SecurityProviderProps): ReactElement | null {
  const {
    children,
    fallback: FallbackComponent,
    error,
  } = props;
  const [auth, setAuth] = useState<KeycloakAdapter | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const keycloakAuth = new KeycloakAdapter(props);
    setAuth(keycloakAuth);

    let cancelled = false;
    void keycloakAuth
      .isAuthenticating()
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [props]);

  if (!auth) {
    return null;
  }

  if (loading) {
    return (<FallbackComponent />);
  }

  return (
    <SecurityContext.Provider
      value={{
        auth,
        fallbackComponent: FallbackComponent,
        errorComponent: error,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

SecurityProvider.defaultProps = {
  responseMode: 'fragment',
  autoRenew: true,
  fallback(): null {
    return null;
  },
  error(err: ErrorComponentProps) {
    return (
      <>
        Error:
        {err.error}
      </>
    );
  },
} as Partial<SecurityProviderProps>;

export default SecurityProvider;
