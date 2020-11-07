import { createContext, FunctionComponent, ReactElement } from 'react';

import KeycloakAdapter from './auth/KeycloakAdapter';

export type ErrorComponentProps = {
  readonly error?: Error;
  readonly authenticated: boolean;
};

export type SecurityContextValue = {
  readonly auth: KeycloakAdapter;
  readonly fallback: ReactElement;
  readonly errorComponent: NonNullable<FunctionComponent<ErrorComponentProps>> | null;
};

export const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export default {};
