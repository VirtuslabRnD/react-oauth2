import { ReactNode } from 'react';

import Secure from './Secure';

class Anonymous<P> extends Secure<P> {
  public render(): ReactNode {
    const { children } = this.props;
    return this.renderChildren(children, false);
  }
}

export default Anonymous;
