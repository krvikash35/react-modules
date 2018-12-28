import { name } from '../utils/constants';

export type TObj = { [name: string]: string | number | boolean };
export type TStrObj = { [name: string]: string };
export interface ICancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}

export const errorCodes = {
  ERR_REQ_ERROR: 'ERR_REQ_ERROR',
  ERR_NO_INTERNET: 'ERR_NO_INTERNET',
  ERR_REQ_CANCELLED: 'ERR_REQ_CANCELLED',
  ERR_REQ_TIMEDOUT: 'ERR_REQ_TIMEDOUT',
  ERR_RES_NON_200: 'ERR_RES_NON_200',
  ERR_RES_PARSE: 'ERR_RES_PARSE'
};

export function addHeadersToRequest(
  userHdrs: TStrObj,
  defaultHdrs: TStrObj,
  request: XMLHttpRequest
) {
  const headers = { ...defaultHdrs, ...userHdrs };
  Object.keys(headers).forEach(hdrKey => {
    request.setRequestHeader(hdrKey, headers[hdrKey].toString());
  });
  const userAccessToken = localStorage.getItem(name.USER_ACCESS_TOKEN);
  if (userAccessToken) {
    request.setRequestHeader('Authorization', `Bearer ${userAccessToken}`);
  }
}

export function getQueryStrFromObj(userQueries: TObj, defaultQueries: TObj) {
  const queries = { ...defaultQueries, ...userQueries };
  if (Object.keys(queries).length === 0) return '';
  return (
    '?' +
    Object.keys(queries)
      .map(k => k + '=' + queries[k])
      .join('&')
  );
}

export function getQueryObjFromStr() {}
