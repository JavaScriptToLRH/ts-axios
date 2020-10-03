import { AxiosInstance } from './types';
import Axios from './core/Axios';
import { extend } from './helpers/util';

// 使用工厂模式创建 axios 混合对象
function createInstance(): AxiosInstance {
  const context = new Axios();
  // instance 本身是一个函数，拥有 Axios 类的所有原型和实例属性
  const instance = Axios.prototype.request.bind(context);

  // 将 context 中的原型方法和实例方法拷贝到 instance 上
  extend(instance, context);

  // typescript 不能正确推断 instance 的类型，所以断言成 AxiosInstance 类型
  return instance as AxiosInstance;
}

const axios = createInstance();

export default axios;
