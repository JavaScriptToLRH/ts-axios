import { parseHeaders } from './helpers/headers';
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types/index';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise(resolve => {
    const { data = null, url, method = 'get', headers, responseType } = config;
    // 初始化一个 XMLHttpRequest 实例对象
    const request = new XMLHttpRequest();

    if (responseType) {
      // 一个用于定义响应类型的枚举值：""（空值）、arraybuffer、blob、document、json、text、ms-stream
      request.responseType = responseType;
    }

    // 初始化一个请求
    request.open(method.toUpperCase(), url, true);

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

      // parseHeaders：对于 XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的字符串类型响应头进行处理，解析成为一个对象结构
      // XMLHttpRequest.getAllResponseHeaders()
      // 以字符串的形式返回所有用 CRLF 分隔的响应头，如果没有收到响应，则返回 null
      const responseHeaders = parseHeaders(request.getAllResponseHeaders());
      const responseData = responseType !== 'text' ? request.response : request.responseText;
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request,
      };
      resolve(response);
    };

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        // 当传入 data 为空的时候，请求 header 配置 Content-Type 无意义，所以进行删除
        delete headers[name];
      } else {
        // 设置 HTTP 请求头的值。必须在 open() 之后、send() 之前调用 setRequestHeader() 方法。
        request.setRequestHeader(name, headers[name]);
      }
    });

    // 发送请求
    request.send(data);
  });
}
