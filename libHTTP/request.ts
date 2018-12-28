import {
  TObj,
  TStrObj,
  ICancellablePromise,
  errorCodes,
  getQueryStrFromObj,
  addHeadersToRequest
} from './util';
import history from '../utils/history';
import { routePath, apiDefault } from '../utils/constants';

type TMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type TResponse = {
  statusCode: number;
  errorCode: '' | keyof typeof errorCodes;
  data: any;
};
type TOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: TStrObj;
  queries?: TObj;
  timeout?: number;
  body?: any;
};

/**
 * Return type  will be same for both success(Resolve) and error(Reject).
 * OnSuccess: `errorCode` will be empty string.
 * OnError: proper `errorCode`, statusCode will be 0 if error before going to server.
 */
export default function request(path: string, options: TOptions = {}) {
  const { BASE_URL, HEADERS, QUERIES, TIMEOUT } = apiDefault;
  const {
    body,
    headers = {},
    queries = {},
    timeout = TIMEOUT,
    method = 'GET'
  } = options;
  const url = BASE_URL + path + getQueryStrFromObj(queries, QUERIES);

  const response = { statusCode: 0, errorCode: '', data: null };
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.timeout = timeout;
  addHeadersToRequest(headers, HEADERS, request);

  const promise = new Promise((resolve, reject) => {
    request.onabort = e => {
      response.errorCode = errorCodes.ERR_REQ_CANCELLED;
      return reject(response);
    };
    request.ontimeout = e => {
      response.errorCode = errorCodes.ERR_REQ_TIMEDOUT;
      return reject(response);
    };
    request.onerror = e => {
      if (!navigator.onLine) {
        response.errorCode = errorCodes.ERR_NO_INTERNET;
        return reject(response);
      }
      response.errorCode = errorCodes.ERR_REQ_ERROR;
      return reject(response);
    };
    request.onload = e => {
      response.statusCode = request.status;
      try {
        response.data = JSON.parse(request.responseText);
      } catch (error) {
        response.errorCode = errorCodes.ERR_RES_PARSE;
        return reject(response);
      }
      if ([200, 201].includes(request.status)) {
        return resolve(response as TResponse);
      }
      if (request.status === 401) {
        history.push(routePath.LOGIN, { from: history.location });
      }
      response.errorCode = errorCodes.ERR_RES_NON_200;
      return reject(response);
    };
    request.send(JSON.stringify(body));
  }) as ICancellablePromise<TResponse>;
  promise.cancel = () => request.abort();
  return promise;
}
