export interface UserProfile {
  readonly id?: string | number;
}

export abstract class AbstractAdapter {
  public abstract isAuthenticated(): boolean;

  public abstract isAuthenticating(): Promise<boolean>;

  public abstract getUserProfile(): UserProfile | undefined;

  public abstract clearToken(): Promise<void>;

  public abstract getAccessToken(): Promise<string | undefined>;

  public abstract login(redirectUri?: string, idpHint?: string, prompt?: 'none' | 'login'): Promise<void>;

  public abstract logout(redirectUri?: string): Promise<void>;
}

export default {};
