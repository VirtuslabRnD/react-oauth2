import { KeycloakInstance } from 'keycloak-js';

export const mockKeycloakLogin = jest.fn();
export const mockKeycloakLogout = jest.fn();
export const mockKeycloakInit = jest.fn();
export const mockKeycloakLoadUserProfile = jest.fn();

export default (): KeycloakInstance => ({
  login: mockKeycloakLogin,
  logout: mockKeycloakLogout,
  init: mockKeycloakInit.mockResolvedValue(false),
  loadUserProfile: mockKeycloakLoadUserProfile,
  token: 'this is a token',
  isTokenExpired: (): boolean => false,
  authenticated: true,
  register: jest.fn(),
  createLoginUrl: jest.fn(),
  createLogoutUrl: jest.fn(),
  createRegisterUrl: jest.fn(),
  createAccountUrl: jest.fn(),
  accountManagement: jest.fn(),
  updateToken: jest.fn(),
  clearToken: jest.fn(),
  hasRealmRole: jest.fn(),
  hasResourceRole: jest.fn(),
  loadUserInfo: jest.fn(),
});

// export default MockedKeycloak;
