import { isPlainObject, deepMerge } from '../helpers/util';
import { AxiosRequestConfig } from '../types';

const strats = Object.create(null);

// 如果自定义配置(val2)中定义了某个属性，就采用自定义的，否则就用默认配置(val1)
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1;
}

// 对于 url、params、data 属性，与每个请求强相关，所以只从自定义配置中获取
function formVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2;
  }
}
const stratKeysFromVal2 = ['url', 'params', 'data'];
stratKeysFromVal2.forEach(key => {
  strats[key] = formVal2Strat;
});

// 对于 headers 采用如下合并策略
function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2);
  } else if (typeof val2 !== 'undefined') {
    return val2;
  } else if (isPlainObject(val1)) {
    return deepMerge(val1);
  } else {
    return val1;
  }
}
const stratKeysDeepMerge = ['headers', 'auth'];
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat;
});

// 对 config1(默认配置) 和 config2(自定义配置) 的属性遍历，执行 mergeField 方法做合并
export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig,
): AxiosRequestConfig {
  if (!config2) {
    config2 = {};
  }

  const config = Object.create(null);

  for (let key in config2) {
    mergeField(key);
  }

  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key);
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat;
    config[key] = strat(config1[key], config2![key]);
  }

  return config;
}
