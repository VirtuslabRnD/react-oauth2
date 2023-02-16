import React, { ComponentType, ComponentClass, ReactNode } from 'react';

import Secure from './Secure';

export default function withSecure<P extends Readonly<P>>(
  WrappedComponent: ComponentType<P>,
  authenticatedRender = true,
): ComponentClass<P> {
  return class extends Secure<P> {
    public render(): ReactNode {
      return this.renderChildren(<WrappedComponent {...this.props} />, authenticatedRender);
    }
  };
}
