import { isPlainObject } from './util';

// 对 header 属性名进行规范化处理，因为 header 属性对于大小写不敏感
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) return;
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
}

// 对 request 的 headers 进行一层加工：header 属性名进行规范化处理，设置默认 Content-Type
export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type');
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }
  }
  return headers;
}

// 对于 XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的字符串类型响应头进行处理，解析成为一个对象结构
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null);
  if (!headers) return parsed;

  headers.split('\r\n').forEach(line => {
    let [key, val] = line.split(':');
    key = key.trim().toLowerCase();
    if (!key) return;
    if (val) val = val.trim();
    parsed[key] = val;
  });

  return parsed;
}
