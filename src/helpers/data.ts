import { isPlainObject } from './util';

// 对 request 中的 data 做一层转换
export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data);
  }
  return data;
}

// 转换为 JSON 对象。在不设置 responseType 的情况下，服务端返回的数据是字符串类型
export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // do noting
    }
  }
  return data;
}
