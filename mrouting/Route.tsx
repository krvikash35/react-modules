import React, { useContext, useMemo } from 'react';

import { getPathParams, getPathParamsKeys } from './util';

export interface IRouteCompProps<T extends object> {
  route: {
    params: { [name in keyof T]?: string };
  };
}
export interface IRouteProps {
  path: string;
  component: React.ComponentType<IRouteCompProps<any>>;
}

export default function Route({ path, component: Component }: IRouteProps) {
  const pathParamKeys = useMemo(() => getPathParamsKeys(path), [path]);
  const route = { params: getPathParams(pathParamKeys, location.pathname) };
  return <Component route={route} />;
}
