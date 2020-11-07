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
  readonly fallback: SecurityContextValue['fallback'];
  readonly error: SecurityContextValue['errorComponent'];
};

function SecurityProvider(props: SecurityProviderProps): ReactElement | null {
  const {
    children,
    fallback,
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
    return fallback;
  }

  return (
    <SecurityContext.Provider
      value={{
        auth,
        fallback,
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
  fallback: undefined,
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
