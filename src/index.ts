import Secure from './Secure';
import SecureRoute from './SecureRoute';
import {
  SecurityContext,
  SecurityContextValue as ISecurityContextValue,
  ErrorComponentProps as IErrorComponentProps,
} from './SecurityContext';
import SecurityProvider from './SecurityProvider';
import withSecure from './withSecure';
import useAuth from './useAuth';

export type SecurityContextValue = ISecurityContextValue;
export type ErrorComponentProps = IErrorComponentProps;

export {
  useAuth,
  Secure,
  SecureRoute,
  SecurityContext,
  SecurityProvider,
  withSecure,
};
