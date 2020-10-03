const toString = Object.prototype.toString;

// 是否为 Data 类型
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]';
}

// 是否为 Object 类型，对于 FormData、ArrayBuffer 这些类型，isObject 判断为 true
export function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object';
}

// 是否为 Object 类型，用于判断普通 Object 类型
export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object, object]';
}

// 将 from 的属性都扩展到 to 中，包括原型上的属性
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    (to as T & U)[key] = from[key] as any;
  }
  return to as T & U;
}

// 深拷贝
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null);
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val);
          } else {
            result[key] = deepMerge({}, val);
          }
        } else {
          result[key] = val;
        }
      });
    }
  });
  return result;
}
