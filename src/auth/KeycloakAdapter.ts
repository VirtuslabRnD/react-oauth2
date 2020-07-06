import Keycloak, {
  KeycloakInitOptions,
  KeycloakInstance,
  KeycloakLoginOptions,
  KeycloakProfile,
} from 'keycloak-js';

import { AbstractAdapter } from './AbstractAdapter';

export interface KeycloakAuthConfig
  extends Pick<KeycloakInitOptions, 'silentCheckSsoRedirectUri' | 'onLoad' | 'responseMode' | 'flow' | 'redirectUri'>,
  Pick<KeycloakLoginOptions, 'locale'> {
  readonly url: string;
  readonly realm: string;
  readonly clientId: string;
  readonly autoRenew?: boolean;
}

export default class KeycloakAdapter extends AbstractAdapter {
  protected readonly keycloak: KeycloakInstance;

  protected readonly config: KeycloakAuthConfig;

  protected readonly initializing: Promise<boolean>;

  protected logging?: Promise<void>;

  protected fetchingUserProfile?: Promise<KeycloakProfile>;

  protected userProfile?: KeycloakProfile;

  public constructor(config: KeycloakAuthConfig) {
    super();

    const {
      autoRenew = true,
      clientId,
      flow,
      realm,
      redirectUri,
      responseMode,
      url,
      onLoad = 'check-sso',
      silentCheckSsoRedirectUri,
    } = config;
    this.config = config;

    this.keycloak = Keycloak({
      clientId,
      realm,
      url,
    });

    const { keycloak } = this;

    keycloak.onTokenExpired = (): void => {
      if (autoRenew) {
        if (flow === 'implicit') {
          void this.login();
        } else {
          void keycloak.updateToken(30);
        }
      } else {
        void this.clearToken();
      }
    };

    keycloak.onAuthRefreshError = (): void => {
      void this.clearToken();
    };

    keycloak.onAuthLogout = (): void => {
      void this.logout();
    };

    this.initializing = keycloak
      .init({
        flow,
        onLoad,
        redirectUri,
        responseMode,
        silentCheckSsoRedirectUri,
        pkceMethod: 'S256',
      });

    void this.fetchUserProfile();
  }

  public isAuthenticated(): boolean {
    const {
      authenticated,
      token,
    } = this.keycloak;

    return Boolean(token && !this.keycloak.isTokenExpired() && authenticated);
  }

  public async isAuthenticating(): Promise<boolean> {
    await this.initializing;

    if (this.logging) {
      await this.logging;
    }

    if (this.isAuthenticated()) {
      await this.fetchUserProfile();
    }

    return this.isAuthenticated();
  }

  protected async fetchUserProfile(): Promise<KeycloakProfile> {
    if (await this.getAccessToken()) {
      if (this.fetchingUserProfile) {
        return this.fetchingUserProfile;
      }

      this.fetchingUserProfile = this.keycloak.loadUserProfile()
        .then((profile: KeycloakProfile): KeycloakProfile => {
          // cache user profile
          this.userProfile = {
            ...profile,
            // add user ID if missing
            id: profile.id || this.keycloak.subject,
          };

          return this.userProfile;
        });

      return this.fetchingUserProfile;
    }

    return Promise.reject();
  }

  public getUserProfile(): KeycloakProfile {
    if (!this.userProfile) {
      throw new Error('Something went wrong, there is no user profile');
    }

    return this.userProfile;
  }

  public clearToken(): Promise<void> {
    return Promise.resolve(this.keycloak.clearToken());
  }

  public async getAccessToken(): Promise<string | undefined> {
    await this.initializing; // wait in case it is initializing...

    if (this.logging) {
      // wait for login...
      await this.logging;
    }
    if (this.isAuthenticated()) {
      // use debug key from env vars if set
      const debugToken = process.env.REACT_APP_DEBUG_ACCESS_TOKEN;
      if (debugToken) {
        return debugToken;
      }
      return this.keycloak.token;
    }

    return undefined;
  }

  public async login(redirectUri?: string, idpHint?: string, prompt?: 'none' | 'login'): Promise<void> {
    const { locale } = this.config;

    if (!this.logging) {
      this.logging = this.initializing.then(async (authenticated) => {
        if (authenticated && this.isAuthenticated()) {
          return Promise.resolve();
        }

        return this.keycloak.login({
          locale,
          prompt,
          redirectUri,
          idpHint,
        });
      });

      await this.logging;
      await this.fetchingUserProfile;
    }

    return this.logging;
  }

  public async logout(redirectUri?: string): Promise<void> {
    await this.keycloak.logout({
      redirectUri,
    });
  }
}
