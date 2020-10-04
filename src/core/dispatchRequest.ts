import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types/index';
import xhr from '../core/xhr';
import { buildURL, combineURL, isAbsoluteURL } from '../helpers/url';
// import { transformRequest, transformResponse } from '../helpers/data';
import { flattenHeaders, processHeaders } from '../helpers/headers';
import transform from './transform';

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config);
  processConfig(config);
  return xhr(config).then(
    res => {
      return transformResponseData(res);
    },
    e => {
      if (e && e.response) {
        e.response = transformResponseData(e.response);
      }
      return Promise.reject(e);
    },
  );
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config);
  // config.headers = transformHeaders(config);
  // config.data = transformRequestData(config);
  config.data = transform(config.data, config.headers, config.transformRequest);
  config.headers = flattenHeaders(config.headers, config.method!);
}

// 处理 URL 参数
export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config;
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url);
  }
  return buildURL(url!, params, paramsSerializer);
}

// 转换请求 body 的数据
// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data);
// }

// 对 request 的 headers 进行一层加工：header 属性名进行规范化处理，设置默认 Content-Type
// function transformHeaders(config: AxiosRequestConfig): any {
//   const { headers = {}, data } = config;
//   return processHeaders(headers, data);
// }

// 转换为 JSON 对象。在不设置 responseType 的情况下，服务端返回的数据是字符串类型
function transformResponseData(res: AxiosResponse): AxiosResponse {
  // res.data = transformResponse(res.data);
  // return res;
  res.data = transform(res.data, res.headers, res.config.transformResponse);
  return res;
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  // 发送请求前检查一下配置的 cancelToken 是否已经使用过了
  // 如果已经被用过则不用法请求，直接抛异常。
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}
