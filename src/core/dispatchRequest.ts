import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types/index';
import xhr from '../core/xhr';
import { buildURL } from '../helpers/url';
import { transformRequest, transformResponse } from '../helpers/data';
import { processHeaders } from '../helpers/headers';

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config);
  return xhr(config).then(res => {
    return transformResponseData(res);
  });
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config);
  config.headers = transformHeaders(config);
  config.data = transformRequestData(config);
}

// 处理 URL 参数
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config;
  return buildURL(url!, params);
}

// 转换请求 body 的数据
function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data);
}

// 对 request 的 headers 进行一层加工：header 属性名进行规范化处理，设置默认 Content-Type
function transformHeaders(config: AxiosRequestConfig): any {
  const { headers = {}, data } = config;
  return processHeaders(headers, data);
}

// 转换为 JSON 对象。在不设置 responseType 的情况下，服务端返回的数据是字符串类型
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data);
  return res;
}
