import React from 'react';
import { render, waitFor } from '@testing-library/react';

import KeycloakAdapter, { KeycloakAuthConfig } from '../src/auth/KeycloakAdapter';
import { ErrorComponentProps, SecurityContext, SecurityContextValue } from '../src/SecurityContext';
import Anonymous from '../src/Anonymous';

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

it('renders without crashing', () => {
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

  render(
    <SecurityContext.Provider value={value}>
      <Anonymous>
        Anonymous Test Content
      </Anonymous>
    </SecurityContext.Provider>,
  );
});

it('fails with no Security Context', () => {
  expect(() => {
    render(
      <Anonymous>
        Anonymous only Test Content
      </Anonymous>,
    );
  }).toThrow(new Error('Security Error: Secure Component has no Context'));
});

it('should show <Fallback /> and not the content if still loading...', () => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent() {
      return <>TEST Loading...</>;
    },
    errorComponent: null,
  };

  auth.login.mockImplementation(() => new Promise(() => {
    // never resolved.
  }));
  auth.isAuthenticated.mockReturnValue(false);
  auth.isAuthenticating.mockResolvedValue(false);

  const { getByText, queryByText } = render(
    <SecurityContext.Provider value={value}>
      <Anonymous>
        Anonymous only Test Content
      </Anonymous>
    </SecurityContext.Provider>,
  );

  expect(getByText('TEST Loading...')).toBeInTheDocument();
  expect(queryByText(/Anonymous only Test Content/)).not.toBeInTheDocument();
});


it('should return anonymous content if and only if user is not logged in', async () => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent() {
      return <>TEST Loading...</>;
    },
    errorComponent: null,
  };

  auth.login.mockResolvedValue();
  auth.isAuthenticated.mockReturnValue(false);
  auth.isAuthenticating.mockResolvedValue(false);

  const { getByText, queryByText } = render(
    <SecurityContext.Provider value={value}>
      <Anonymous>
        Anonymous only Test Content
      </Anonymous>
      Public things
    </SecurityContext.Provider>,
  );

  // wait for auth.login...
  await waitFor(() => {
    expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
  });

  expect(getByText(/Public things/)).toBeInTheDocument();
  expect(getByText(/Anonymous only Test Content/)).toBeInTheDocument();
  expect(queryByText(/THIS IS ACCESS ERROR! Login TEST Error. TEST/)).not.toBeInTheDocument();
  expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
});

it('shouldn\'t return anonymous content when login correctly', async () => {
  const auth = new KeycloakAdapter(config) as jest.Mocked<KeycloakAdapter>;
  const value: SecurityContextValue = {
    auth,
    fallbackComponent() {
      return <>TEST Loading...</>;
    },
    errorComponent({ error }: ErrorComponentProps) {
      return (
        <div>
          {`THIS IS ACCESS ERROR! ${error.message}. TEST`}
        </div>
      );
    },
  };

  auth.login.mockResolvedValue();
  auth.isAuthenticated.mockReturnValue(false); // false, because "it isn't isAuthenticated yet"
  auth.isAuthenticating.mockResolvedValue(false);

  const { getByText, queryByText } = render(
    <SecurityContext.Provider value={value}>
      <Anonymous>
        Anonymous only Test Content
      </Anonymous>
      Public things
    </SecurityContext.Provider>,
  );

  auth.isAuthenticated.mockReturnValue(true);
  auth.isAuthenticating.mockResolvedValue(true);
  // wait for auth.login...
  await waitFor(() => {
    expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
  });

  expect(getByText(/Public things/)).toBeInTheDocument();
  expect(queryByText(/Anonymous only Test Content/)).not.toBeInTheDocument();
  expect(queryByText(/THIS IS ACCESS ERROR!/)).not.toBeInTheDocument();
  expect(queryByText(/TEST Loading\.\.\./)).not.toBeInTheDocument();
});
