import React, { Component, ContextType, ReactNode } from 'react';

import { SecurityContext } from './SecurityContext';

export type SecureState = {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
};

export type Props = {
  readonly autologin?: boolean;
  readonly prompt?: 'none' | 'login';
  readonly redirectUri?: string;
};

export default class Secure<P> extends Component<P & Props, SecureState> {
  public readonly state: SecureState = {
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Pick<SecureState, 'error'> {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public readonly context!: ContextType<typeof SecurityContext>;

  public componentDidMount(): void {
    if (!this.context) {
      throw new Error('Security Error: Secure Component has no Context');
    }

    const { auth } = this.context;
    const { prompt, redirectUri, autologin = true } = this.props;

    if (auth.isAuthenticated()) {
      this.setState(() => ({ isLoading: false, isAuthenticated: true }));
    } else {
      auth.isAuthenticating()
        .then(async () => {
          if (!auth.isAuthenticated() && autologin) {
            await auth.login(redirectUri, undefined, prompt);
          }
        })
        .then(() => {
          this.setState(() => ({ isLoading: false, isAuthenticated: auth.isAuthenticated() }));
        })
        .catch((error: Error) => {
          // do not throw the error directly with the promise...
          this.setState(() => ({ isLoading: false, error }));
        });
    }
  }

  public static readonly contextType = SecurityContext;

  protected renderChildren(children: ReactNode, authenticatedRender = true): ReactNode {
    // this method is here to deduplicate `render()` in `withSecure` HOC
    if (!this.context) {
      throw new Error('Security Error: Secure Component has no Context');
    }

    const { isAuthenticated, isLoading, error } = this.state;
    const { fallbackComponent: FallbackComponent, errorComponent: ErrorComponent } = this.context;

    if (error) {
      return ErrorComponent ? <ErrorComponent error={error} /> : 'Access Denied.';
    }

    if (isLoading) {
      return <FallbackComponent />;
    }

    if (authenticatedRender ? isAuthenticated : !isAuthenticated) {
      return children;
    }

    return null;
  }

  public render(): ReactNode {
    const { children } = this.props;
    return this.renderChildren(children);
  }
}
