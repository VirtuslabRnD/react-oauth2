import KeycloakAdapter, { KeycloakAuthConfig } from '../../src/auth/KeycloakAdapter';

import {
  mockKeycloakLogin,
  mockKeycloakLogout,
  mockKeycloakLoadUserProfile,
} from '../../__mocks__/keycloak-js';

const config: KeycloakAuthConfig = {
  realm: 'test-realm',
  clientId: 'test-clientid',
  url: 'test://keycloak/auth',
  locale: 'en-gb',
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  mockKeycloakLoadUserProfile.mockResolvedValue({
    id: 12345,
  });
});

it('should call keycloak.login properly', async () => {
  const keycloakAdapter = new KeycloakAdapter(config);

  await keycloakAdapter.login('/redirect/url');

  const locale = 'en-gb';
  expect(mockKeycloakLogin).toBeCalledWith({
    idpHint: undefined,
    locale,
    prompt: undefined,
    redirectUri: '/redirect/url',
  });
});

it('should return a token', async () => {
  const keycloakAdapter = new KeycloakAdapter(config);

  await keycloakAdapter.login('/redirect/url');

  expect(await keycloakAdapter.getAccessToken()).toBe('this is a token');
});

it('should call keycloak.logout properly', async () => {
  const keycloakAdapter = new KeycloakAdapter(config);

  await keycloakAdapter.login();
  await keycloakAdapter.logout('/logout/url');

  expect(mockKeycloakLogout).toBeCalledWith({
    redirectUri: '/logout/url',
  });
});

it('should return user profile', async () => {
  mockKeycloakLoadUserProfile.mockResolvedValue({
    id: 'f:12:54',
    username: 'my user name',
    email: 'user@email.co.uk',
  });

  const keycloakAdapter = new KeycloakAdapter(config);

  await keycloakAdapter.login();

  expect(keycloakAdapter.isAuthenticated()).toBe(true);

  expect(keycloakAdapter.getUserProfile()).toEqual({
    id: 'f:12:54',
    username: 'my user name',
    email: 'user@email.co.uk',
  });
});
