import { createContext, FunctionComponent } from 'react';

import KeycloakAdapter from './auth/KeycloakAdapter';

export type ErrorComponentProps = {
  readonly error: Error;
};

export type SecurityContextValue = {
  readonly auth: KeycloakAdapter;
  readonly fallbackComponent: NonNullable<FunctionComponent>;
  readonly errorComponent: NonNullable<FunctionComponent<ErrorComponentProps>> | null;
};

export const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export default {};
