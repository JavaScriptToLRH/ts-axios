import { isDate, isPlainObject } from './util';

// 特殊字符处理
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

// 处理请求的 URL 参数
export function buildURL(url: string, params?: any): string {
  if (!params) return url;

  const parts: string[] = [];
  Object.keys(params).forEach(key => {
    const val = params[key];
    // 空值忽略：对置为 null 或 undefined 的属性，不添加到 url 参数中
    if (val === null || typeof val === 'undefined') return;
    let values = [];
    if (Array.isArray(val)) {
      // 参数值为数组
      // params: { foo: ['bar', 'baz'] } -> /base/get?foo[]=bar&foo[]=baz
      values = val;
      key += '[]';
    } else {
      values = [val];
    }
    values.forEach(val => {
      if (isDate(val)) {
        // 参数为 Date 类型
        val = val.toISOString();
      } else if (isPlainObject(val)) {
        // 参数为普通对象
        val = JSON.stringify(val);
      }
      parts.push(`${encode(key)}=${encode(val)}`);
    });
  });

  let serializedParams = parts.join('&');
  if (serializedParams) {
    // 丢弃 url 中的哈希标记
    // url: '/base/get#hash', params: { foo: 'bar' } -> /base/get?foo=bar
    const markIndex = url.indexOf('#');
    if (markIndex !== -1) {
      url = url.slice(0, markIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}
