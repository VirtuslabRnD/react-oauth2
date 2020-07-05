import React, { ComponentType, FunctionComponent, ReactNode } from 'react';
import { KeycloakProfile } from 'keycloak-js';

import KeycloakAdapter, { KeycloakAuthConfig } from './auth/KeycloakAdapter';

import { SecurityContext, SecurityContextValue, ErrorComponentProps } from '.';

jest.mock('keycloak-js');
jest.mock('./auth/KeycloakAdapter');

const config: KeycloakAuthConfig = {
  realm: 'test-realm',
  clientId: 'test-clientid',
  url: 'test://keycloak/auth',
};

const withTestSecurityContextProvider = (
  token: Promise<string>,
  userProfile?: KeycloakProfile,
  isAuthenticated?: boolean,
  fallbackComponent?: NonNullable<FunctionComponent>,
  errorComponent?: NonNullable<FunctionComponent<ErrorComponentProps>>,
): ReactNode => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent: fallbackComponent || (() => <>TEST Loading...</>) as FunctionComponent,
    errorComponent: errorComponent || null,
  };

  auth.login.mockResolvedValue();
  auth.isAuthenticated.mockReturnValue(isAuthenticated || true);
  auth.isAuthenticating.mockResolvedValue(isAuthenticated || true);
  auth.getAccessToken.mockReturnValue(token);
  if (userProfile) {
    auth.getUserProfile.mockReturnValue(userProfile);
  }

  return function enhance<WrappedProps>(
    WrappedComponent: ComponentType<WrappedProps>,
  ) {
    return function context(props: WrappedProps): ReactNode {
      return (
        <SecurityContext.Provider value={value}>
          <WrappedComponent {...props} />
        </SecurityContext.Provider>
      );
    };
  };
};

export default withTestSecurityContextProvider;
