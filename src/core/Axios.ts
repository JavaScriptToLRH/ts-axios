import {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  RejectedFn,
  ResolvedFn,
} from '../types';
import dispatchRequest from './dispatchRequest';
import InterceptorManager from './InterceptorManager';

// 定义拦截器接口
interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>;
  response: InterceptorManager<AxiosResponse>;
}

// 链式调用接口
interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise);
  rejected?: RejectedFn;
}

export default class Axios {
  interceptors: Interceptors;

  constructor() {
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>(),
    };
  }

  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {};
      }
      config.url = url;
    } else {
      config = url;
    }

    // 链式调用。拦截器执行顺序为：
    // 对于请求拦截器，先执行后添加的，再执行先添加的
    // 对于响应连接器，先执行先添加的，在执行后添加的

    // 构造一个 PromiseChain 类型的数组
    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined,
      },
    ];

    // 调用 InterceptorManager 类中 forEach 方法将请求拦截器插入到 chain 数组的前面
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor);
    });

    // 调用 InterceptorManager 类中 forEach 方法将响应拦截器插入到 chain 数组的后面
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor);
    });

    // 定义一个已经 resolve 的 promise
    let promise = Promise.resolve(config);

    // 遍历 chain，获取到每个拦截器对象，拿到 resolved 函数和 rejected 函数添加到 promise.then 的参数中
    // 相当于通过 Promise 的链式调用方式，实现拦截器一层层的链式调用效果
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!;
      promise = promise.then(resolved, rejected);
    }

    return promise;
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config);
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config);
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config);
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config);
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
      }),
    );
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data,
      }),
    );
  }
}
