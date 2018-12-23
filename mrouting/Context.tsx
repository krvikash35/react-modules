import React from 'react';

export type TRouterContextState = {
  currentPath: string;
  navigate: (pathname: string) => void;
};

const RouterContext = React.createContext({} as TRouterContextState);

export default RouterContext;
