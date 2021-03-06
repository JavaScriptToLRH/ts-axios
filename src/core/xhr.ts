import { parseHeaders } from '../helpers/headers';
import { createError } from '../helpers/error';
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types/index';
import { isURLSameOrigin } from '../helpers/url';
import cookie from '../helpers/cookie';
import { isFormData } from '../helpers/util';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method,
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus,
    } = config;

    // 1.创建一个 request 实例：初始化一个 XMLHttpRequest 实例对象
    const request = new XMLHttpRequest();
    // 2.初始化一个请求
    request.open(method!.toUpperCase(), url!, true);
    // 3.配置 reques 对象
    configureRequest();
    // 4.给 request 添加事件处理函数
    addEvents();
    // 5.处理请求 headers
    processHeaders();
    // 6.处理请求取消逻辑
    processCancel();
    // 7.发送请求
    request.send(data);

    function configureRequest(): void {
      if (responseType) {
        // 一个用于定义响应类型的枚举值：""（空值）、arraybuffer、blob、document、json、text、ms-stream
        request.responseType = responseType;
      }

      if (timeout) {
        // 设置超时
        request.timeout = timeout;
      }

      if (withCredentials) {
        // 用于指定跨域 Access-Control 请求是否应当带有授权信息
        request.withCredentials = withCredentials;
      }
    }

    function addEvents(): void {
      // onreadystatechange：当 readyState 属性发生变化时，调用 EventHandler
      // XMLHttpRequest.readyState 属性返回一个 XMLHttpRequest 代理当前所处的状态。
      // 一个 XHR 代理总是处于下列状态中的一个：
      // 0 - UNSENT - XMLHttpRequest 代理已被创建，但尚未调用 open() 方法
      // 1 - OPENED - open() 方法已经被调用。在这个状态中，可以通过  setRequestHeader() 方法来设置请求的头部，可以调用 send() 方法来发起请求
      // 2 - HEADERS_RECEIVED - send() 方法已经被调用，响应头也已经被接收
      // 3 - LOADING - 响应体部分正在被接收。如果 responseType 属性是“text”或空字符串， responseText 将会在载入的过程中拥有部分响应数据
      // 4 - DONE - 请求操作已经完成。这意味着数据传输已经彻底完成或失败
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) return;
        if (request.status === 0) return;

        // parseHeaders：对于 XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的字符串类型响应头进行处理，解析成为一个对象结构
        // XMLHttpRequest.getAllResponseHeaders()
        // 以字符串的形式返回所有用 CRLF 分隔的响应头，如果没有收到响应，则返回 null
        const responseHeaders = parseHeaders(request.getAllResponseHeaders());
        const responseData =
          responseType && responseType !== 'text' ? request.response : request.responseText;
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request,
        };
        // 处理响应数据
        handleResponse(response);
      };

      // 当 request 遭遇错误时触发
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request));
      };

      // 当在预设时间内没有接收到响应时触发。
      request.ontimeout = function handleTimeout() {
        reject(
          createError(`Timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', request),
        );
      };

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress;
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress;
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type'];
      }

      // 用于指定跨域 Access-Control 请求带有授权信息
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName);
        if (xsrfValue) {
          headers[xsrfHeaderName!] = xsrfValue;
        }
      }

      if (auth) {
        // HTTP 协议中的 Authorization 请求 header 会包含服务器用于验证用户代理身份的凭证
        // 通常会在服务器返回 401 Unauthorized 状态码以及 WWW-Authenticate 消息头之后在后续请求中发送此消息头。
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password);
      }

      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          // 当传入 data 为空的时候，请求 header 配置 Content-Type 无意义，所以进行删除
          delete headers[name];
        } else {
          // 设置 HTTP 请求头的值。必须在 open() 之后、send() 之前调用 setRequestHeader() 方法。
          request.setRequestHeader(name, headers[name]);
        }
      });
    }

    function processCancel(): void {
      // 取消请求逻辑
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort();
            reject(reason);
          })
          .catch(
            /* istanbul ignore next */
            () => {
              // do nothing
            },
          );
      }
    }

    function handleResponse(response: AxiosResponse): void {
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response,
          ),
        );
      }
    }
  });
}
