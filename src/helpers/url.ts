import { isDate, isPlainObject } from './util';

interface URLOrigin {
  protocol: string;
  host: string;
}

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

// 判断是否为同一域名
// 创建一个 a 标签的 DOM，设置 href 属性为传入的 URL，获取 DOM 的 protocol、host
// 通过对比当前页面 url 和请求 url 它们的  protocol、host 是否相同
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL);
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  );
}

const urlParsingNode = document.createElement('a');
const currentOrigin = resolveURL(window.location.href);

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url);
  const { protocol, host } = urlParsingNode;
  return { protocol, host };
}
