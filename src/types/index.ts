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
  url?: string; // 请求地址
  method?: Method; // 请求的 HTTP 方法
  data?: any; // post、patch 等类型请求的数据，存放在 request body 中
  params?: any; // get、head 等类型请求的数据，拼接到 url 的 query string 中
  headers?: any; // 请求头
  responseType?: XMLHttpRequestResponseType; // 指定响应的数据类型，通过设置 XMLHttpRequest 对象的 responseType 属性。一个 XMLHttpRequestResponseType 类型，定义是 "" | "arraybuffer" | "blob" | "document" | "json" | "text" 字符串字面量类型
  timeout?: number; // 超时时间
  transformRequest?: AxiosTransformer | AxiosTransformer[];
  transformResponse?: AxiosTransformer | AxiosTransformer[];
  cancelToken?: CancelToken;

  [propName: string]: any;
}

export interface AxiosTransformer {
  (data: any, headers?: any): any;
}

// 定义 AxiosResponse 接口类型。T=any 表示泛型的类型参数默认值为 any
export interface AxiosResponse<T = any> {
  data: T; // 服务端返回的数据
  status: number; // HTTP状态码
  statusText: string; // 状态消息
  headers: any; // 响应头
  config: AxiosRequestConfig; // 请求配置对象
  request: any; // 请求的 XMLHttpRequest 对象实例 request
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

// 定义 AxiosError 类型接口，用于外部使用。继承与 Error 类
export interface AxiosError extends Error {
  config: AxiosRequestConfig; // 请求对象配置
  code?: string; // 错误代码
  request?: any; // XMLHttpRequest 对象实例
  response?: AxiosResponse; // 自定义响应对象 response
  isAxiosError: boolean;
}

// 定义一个 Axios 类型接口，描述 Axios 类中的公用方法
export interface Axios {
  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
  // GET方法请求一个指定资源的表示形式. 使用GET的请求应该只被用于获取数据
  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  // DELETE方法删除指定的资源
  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  // HEAD方法请求一个与GET请求的响应相同的响应，但没有响应体
  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  // OPTIONS方法用于描述目标资源的通信选项
  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  // POST方法用于将实体提交到指定的资源，通常导致在服务器上的状态变化或副作用
  post<T = any>(url: string, data: any, config?: AxiosRequestConfig): AxiosPromise<T>;
  // PUT方法用请求有效载荷替换目标资源的所有当前表示
  put<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  // PATCH方法用于对资源应用部分修改
  patch<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
}

// 混合类型的接口，继承于 Axios
export interface AxiosInstance extends Axios {
  // 函数重载
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
}

export interface AxiosStatic extends AxiosInstance {
  // 接受一个 AxiosRequestConfig 类型的配置，作为默认配置的扩展，也可以接受不传参数
  create(config?: AxiosRequestConfig): AxiosInstance;

  CancelToken: CancelTokenStatic;
  Cancel: CancelStatic;
  isCancel: (value: any) => boolean;
}

// 定义拦截器 AxiosInterceptorManager 泛型接口
export interface AxiosInterceptorManager<T> {
  // 添加拦截器到 interceptors 中，并返回一个 id 用于删除
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number;

  // 删除一个拦截器，通过传入拦截器的 id 删除
  eject(id: number): void;
}

// 对于 resolve 函数的参数，请求拦截器和响应拦截器是不同的
export interface ResolvedFn<T> {
  (val: T): T | Promise<T>;
}

export interface RejectedFn {
  (error: any): any;
}

// 实例类型的接口定义
export interface CancelToken {
  promise: Promise<Cancel>;
  reason?: Cancel;

  throwIfRequested(): void;
}

// 请求取消方法的接口定义
export interface Canceler {
  (message?: string): void;
}

// CancelToken 类构造函数参数的接口定义
export interface CancelExecutor {
  (cancel: Canceler): void;
}

// CancelTokenSource 作为 CancelToken 类静态方法 source 函数的返回值类型
export interface CancelTokenSource {
  token: CancelToken;
  cancel: Canceler;
}

// CancelTokenStatic 则作为 CancelToken 类的类类型
export interface CancelTokenStatic {
  new (executor: CancelExecutor): CancelToken;
  source(): CancelTokenSource;
}

// 定义实例类型的接口
export interface Cancel {
  message?: string;
}

// CancelStatic 是类类型的接口定义
export interface CancelStatic {
  new (message?: string): Cancel;
}
