import React, { ReactElement } from 'react';
import { render, wait } from '@testing-library/react';

import KeycloakAdapter, { KeycloakAuthConfig } from '../src/auth/KeycloakAdapter';

import { SecurityContext, SecurityContextValue } from '../src/SecurityContext';
import withSecure from '../src/withSecure';

jest.mock('../src/auth/KeycloakAdapter');

const config: KeycloakAuthConfig = {
  realm: 'test-realm',
  clientId: 'test-clientid',
  url: 'test://keycloak/auth',
};

// ensure you're resetting modules before each test
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

it('renders withSecure and withoutSecurity HOCs properly when authenticated', async () => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent() {
      return <>TEST Loading...</>;
    },
    errorComponent: null,
  };

  auth.login.mockResolvedValue();
  auth.isAuthenticated.mockReturnValue(false); // false, because "it isn't isAuthenticated yet"
  auth.isAuthenticating.mockResolvedValue(false);

  function SecuredComponent(): ReactElement {
    return <div>TEST Secured Component TEST</div>;
  }
  function UnSecuredComponent(): ReactElement {
    return <div>TEST UnSecured Component TEST</div>;
  }
  const SecuredComponentWithSecure = withSecure(SecuredComponent);
  const UnSecuredComponentWithoutSecure = withSecure(UnSecuredComponent, false);


  const { getByText, queryByText } = render(
    <SecurityContext.Provider value={value}>
      <SecuredComponentWithSecure />
      <UnSecuredComponentWithoutSecure />
    </SecurityContext.Provider>,
  );

  auth.isAuthenticated.mockReturnValue(true);
  auth.isAuthenticating.mockResolvedValue(true);
  // wait for auth.login...
  await wait(() => {
    expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
  });

  expect(getByText('TEST Secured Component TEST')).toBeInTheDocument();
  expect(queryByText(/TEST UnSecured Component TEST/)).not.toBeInTheDocument();
  expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
});

it('renders withSecure and withoutSecurity HOCs properly when NOT authenticated', async () => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent() {
      return <>TEST Loading...</>;
    },
    errorComponent: null,
  };

  auth.isAuthenticated.mockReturnValue(false);
  auth.isAuthenticating.mockResolvedValue(false);
  auth.login.mockResolvedValue();

  function SecuredComponent(): ReactElement {
    return <div>TEST Secured Component TEST</div>;
  }
  function UnSecuredComponent(): ReactElement {
    return <div>TEST UnSecured Component TEST</div>;
  }
  const SecuredComponentWithSecure = withSecure(SecuredComponent);
  const UnSecuredComponentWithoutSecure = withSecure(UnSecuredComponent, false);


  const { getByText, queryByText } = render(
    <SecurityContext.Provider value={value}>
      <SecuredComponentWithSecure />
      <UnSecuredComponentWithoutSecure />
    </SecurityContext.Provider>,
  );

  // wait for auth.login...
  await wait(() => {
    expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
  });

  expect(getByText('TEST UnSecured Component TEST')).toBeInTheDocument();
  expect(queryByText(/TEST Secured Component TEST/)).not.toBeInTheDocument();
  expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
});
