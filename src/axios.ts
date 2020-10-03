import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from './types';
import Axios from './core/Axios';
import { extend } from './helpers/util';
import defaults from './defaults';
import mergeConfig from './core/mergeConfig';
import CancelToken from './cancel/CancelToken';
import Cancel, { isCancel } from './cancel/Cancel';

// 使用工厂模式创建 axios 混合对象
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config);
  // instance 本身是一个函数，拥有 Axios 类的所有原型和实例属性
  const instance = Axios.prototype.request.bind(context);

  // 将 context 中的原型方法和实例方法拷贝到 instance 上
  extend(instance, context);

  // typescript 不能正确推断 instance 的类型，所以断言成 AxiosStatic 类型
  return instance as AxiosStatic;
}

const axios = createInstance(defaults);

axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config));
};
axios.CancelToken = CancelToken;
axios.Cancel = Cancel;
axios.isCancel = isCancel;

export default axios;
