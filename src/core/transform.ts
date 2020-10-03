import { AxiosTransformer } from '../types';

// 对请求数据和响应数据调用多个转换函数进行处理
// 使用 transform 处理这些函数的调用逻辑
// fns 表示一个或者多个转换函数，遍历 fns 执行转换函数，并把 data 和 headers 作为参数传入
// 每个转换函数返回的 data 会作为下一个转换函数的参数 data 传入
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[],
): any {
  if (!fns) return data;
  if (!Array.isArray(fns)) {
    fns = [fns];
  }
  fns.forEach(fn => {
    data = fn(data, headers);
  });
  return data;
}
