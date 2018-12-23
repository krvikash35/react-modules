type TParams<T extends object> = { [index in keyof T]: string };

export function getPathRegex(path: string) {
  return new RegExp('^' + path.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
}

export function getPathParamsKeys(path: string) {
  let pathParamsKey = {};
  const pathArr = path.split('/');
  pathArr.forEach((p, index) => {
    if (p.startsWith(':')) {
      pathParamsKey[p.split(':')[1]] = index;
    }
  });
  return pathParamsKey;
}

export function getPathParams<T extends object>(
  paramKeys: T,
  currentPath: string
) {
  const pathParams = {};
  const currPathArr = currentPath.split('/');
  Object.keys(paramKeys).forEach(pname => {
    pathParams[pname] = currPathArr[paramKeys[pname]];
  });
  return pathParams as TParams<T>;
}
