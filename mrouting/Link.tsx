import React, { useContext } from 'react';
import { SerializedStyles } from '@emotion/core';

import RoutingContext from './Context';

type TypeProps = {
  to: string;
  activecss?: SerializedStyles;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export default function Link({ activecss, to, ...props }: TypeProps) {
  const { currentPath, navigate } = useContext(RoutingContext);
  const isActive = currentPath === to;
  return (
    <a
      href={to}
      {...props}
      css={isActive && activecss}
      onClick={e => {
        e.preventDefault();
        navigate(to);
      }}>
      {props.children}
    </a>
  );
}
