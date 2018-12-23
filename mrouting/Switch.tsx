import React, { useContext } from 'react';

import { IRouteProps } from './Route';
import RoutingContext from './Context';
import { getPathRegex } from './util';

type TSwitchChild = React.ReactElement<IRouteProps>;
interface ISwitchProps {
  children: TSwitchChild[];
  notFound: React.ComponentType;
}

export default function Switch(props: ISwitchProps) {
  const { notFound: NotFound, children } = props;
  const { currentPath } = useContext(RoutingContext);
  const childs = React.Children.toArray(children) as TSwitchChild[];
  let Route = childs.find(c => {
    return getPathRegex(c.props.path).test(currentPath);
  });
  return Route ? Route : <NotFound />;
}
