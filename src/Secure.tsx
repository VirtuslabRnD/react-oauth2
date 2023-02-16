import React, {
  Component,
  ContextType,
  ReactNode,
  ReactElement,
} from 'react';

import { SecurityContext } from './SecurityContext';

export type SecureState = {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
};

export type Props = {
  readonly otherwise?: ReactElement;
} & { children?: ReactNode | undefined };

// todo rewrite it to function-component
export default class Secure<P> extends Component<P & Props, SecureState> {
  public static readonly contextType = SecurityContext;

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

    if (auth.isAuthenticated()) {
      this.setState(() => ({ isLoading: false, isAuthenticated: true }));
    } else {
      auth.isAuthenticating()
        .then(() => {
          this.setState(() => ({ isLoading: false, isAuthenticated: auth.isAuthenticated() }));
        })
        .catch((error: Error) => {
          // do not throw the error directly with the promise...
          this.setState(() => ({ isLoading: false, error }));
        });
    }
  }

  protected renderChildren(children: ReactNode, authenticatedRender = true): ReactNode {
    // this method is here to deduplicate `render()` in `withSecure` HOC
    if (!this.context) {
      throw new Error('Security Error: Secure Component has no Context');
    }

    const { isAuthenticated, isLoading, error } = this.state;
    const { fallback, errorComponent: ErrorComponent } = this.context;
    const { otherwise } = this.props;

    if (error) {
      return ErrorComponent ? <ErrorComponent authenticated={isAuthenticated} error={error} /> : 'Access Denied.';
    }

    if (isLoading) {
      return fallback;
    }

    if (authenticatedRender ? isAuthenticated : !isAuthenticated) {
      return children;
    }

    return otherwise || null;
  }

  public render(): ReactNode {
    const { children } = this.props;
    return this.renderChildren(children);
  }
}
