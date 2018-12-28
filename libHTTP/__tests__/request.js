import request from '../request';
import { errorCodes } from '../util';

let onXHRTimeout, onXHRLoad, onXHRError, onXHRAbort, setResponse;
const mockXHROpen = jest.fn();
const mockXHRSetRequestHeader = jest.fn();
const mockXHRSend = jest.fn().mockImplementation(function() {
  setResponse = (code, text) => {
    this.responseText = text;
    this.status = code;
  };
  onXHRTimeout = this.ontimeout.bind(this);
  onXHRLoad = this.onload.bind(this);
  onXHRError = this.onerror.bind(this);
  onXHRAbort = this.onabort.bind(this);
});

global.XMLHttpRequest = jest
  .fn()
  .mockName('mockXHR')
  .mockImplementation(() => ({
    open: mockXHROpen,
    send: mockXHRSend,
    setRequestHeader: mockXHRSetRequestHeader
  }));

beforeEach(() => {
  global.XMLHttpRequest.mockClear();
  mockXHROpen.mockClear();
  mockXHRSetRequestHeader.mockClear();
  mockXHRSend.mockClear();
});

// TODO: assert timeout
it('check basic xhr calls and success scenario', async () => {
  const options = {
    method: 'POST',
    body: { name: 'vikash' },
    headers: { hdr1key: 'hdr1value', hdr2key: 'hdr2value' },
    queries: { q1key: 'q1Value', q2key: 'q2value' },
    timeout: 500
  };
  const response = request('/orders', options);
  expect(XMLHttpRequest).toHaveBeenCalledTimes(1);
  expect(mockXHROpen).toHaveBeenCalledWith(
    'POST',
    '/orders?q1key=q1Value&q2key=q2value'
  );
  expect(mockXHRSetRequestHeader).toHaveBeenNthCalledWith(
    1,
    'Content-Type',
    'application/json; charset=utf-8'
  ); //default
  expect(mockXHRSetRequestHeader).toHaveBeenNthCalledWith(
    2,
    'hdr1key',
    'hdr1value'
  );
  expect(mockXHRSetRequestHeader).toHaveBeenNthCalledWith(
    3,
    'hdr2key',
    'hdr2value'
  );

  expect(typeof response.cancel).toBe('function');

  setResponse(200, '{"name":"vikash"}');
  onXHRLoad();
  const res = await response;
  expect(res.data).toEqual({ name: 'vikash' });
  expect(res.statusCode).toBe(200);
  expect(res.errorCode).toBe('');
});

it('should throw error on request cancel', async () => {
  try {
    const response = request('/orders');
    setResponse(0, null);
    onXHRAbort();
    await response;
  } catch (res) {
    expect(res.data).toBe(null);
    expect(res.statusCode).toBe(0);
    expect(res.errorCode).toBe(errorCodes.ERR_REQ_CANCELLED);
  }
});

it('should throw error on request timeout', async () => {
  try {
    const response = request('/orders');
    setResponse(0, null);
    onXHRTimeout();
    await response;
  } catch (res) {
    expect(res.data).toBe(null);
    expect(res.statusCode).toBe(0);
    expect(res.errorCode).toBe(errorCodes.ERR_REQ_TIMEDOUT);
  }
});

it('should throw error when there is no interent', async () => {
  try {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    const response = request('/orders');
    setResponse(0, null);
    onXHRError();
    await response;
  } catch (res) {
    expect(res.data).toBe(null);
    expect(res.statusCode).toBe(0);
    expect(res.errorCode).toBe(errorCodes.ERR_NO_INTERNET);
  }
});

it('should throw error when some other request error', async () => {
  try {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    const response = request('/orders');
    setResponse(0, null);
    onXHRError();
    await response;
  } catch (res) {
    expect(res.data).toBe(null);
    expect(res.statusCode).toBe(0);
    expect(res.errorCode).toBe(errorCodes.ERR_NO_INTERNET);
  }
});

it('should throw error when server response is not 2XX', async () => {
  try {
    const response = request('/orders');
    setResponse(401, '"Unauthorized access"');
    onXHRLoad();
    await response;
  } catch (res) {
    expect(res.data).toBe('Unauthorized access');
    expect(res.statusCode).toBe(401);
    expect(res.errorCode).toBe(errorCodes.ERR_RES_NON_200);
  }
});

it('should throw error when error parsing server response', async () => {
  try {
    const response = request('/orders');
    setResponse(200, '{name: "vikash"}');
    onXHRLoad();
    await response;
  } catch (res) {
    expect(res.data).toBe(null);
    expect(res.statusCode).toBe(200);
    expect(res.errorCode).toBe(errorCodes.ERR_RES_PARSE);
  }
});
