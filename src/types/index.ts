// 请求的HTTP方法类型
export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH';

// 定义 AxiosRequestConfig 接口类型
export interface AxiosRequestConfig {
  url: string; // 请求地址，必选
  method?: Method; // 请求的 HTTP 方法
  data?: any; // post、patch 等类型请求的数据，存放在 request body 中
  params?: any; // get、head 等类型请求的数据，拼接到 url 的 query string 中
  headers?: any; // 请求头
  responseType?: XMLHttpRequestResponseType; // 指定响应的数据类型，通过设置 XMLHttpRequest 对象的 responseType 属性。一个 XMLHttpRequestResponseType 类型，定义是 "" | "arraybuffer" | "blob" | "document" | "json" | "text" 字符串字面量类型
}

// 定义 AxiosResponse 接口类型
export interface AxiosResponse {
  data: any; // 服务端返回的数据
  status: number; // HTTP状态码
  statusText: string; // 状态消息
  headers: any; // 响应头
  config: AxiosRequestConfig; // 请求配置对象
  request: any; // 请求的 XMLHttpRequest 对象实例 request
}

export interface AxiosPromise extends Promise<AxiosResponse> {}
