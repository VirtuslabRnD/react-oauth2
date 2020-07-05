import { useContext } from 'react';

import { SecurityContext, SecurityContextValue } from './SecurityContext';
import KeycloakAdapter from './auth/KeycloakAdapter';

export default function useAuth(): KeycloakAdapter {
  const context = useContext<SecurityContextValue | undefined>(SecurityContext);

  if (!context) {
    throw new Error('Security Error: Secure Component has no Context');
  }

  return context.auth;
}
