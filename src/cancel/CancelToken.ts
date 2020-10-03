import { Canceler, CancelExecutor, CancelTokenSource } from '../types';
import Cancel from './Cancel';

interface ResolvePromise {
  (reson?: Cancel): void;
}

export default class CancelToken {
  promise: Promise<Cancel>;
  reason?: Cancel;

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise;
    // 实例化一个 pending 状态的 Promise 对象
    // 使用一个 resolvePromise 变量指向 resolve 函数
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve;
    });

    // 执行 executor 函数
    // 传入 cancel 函数，在 cancel 函数内部，会调用 resolvePromise 把 Promise 函数从 pending 状态变为 resolved 状态
    executor(message => {
      if (this.reason) return;
      this.reason = new Cancel(message);
      resolvePromise(this.reason);
    });
  }

  throwIfRequested(): void {
    // 判断如果存在 this.reason，说明这个 token 已经被使用过了，直接抛错
    if (this.reason) throw this.reason;
  }

  static source(): CancelTokenSource {
    // 定义 cancel 变量实例化 CancelToken 类型的对象
    // 在 executor 函数中，把 cancel 指向参数 c 这个取消函数
    let cancel!: Canceler;
    const token = new CancelToken(c => {
      cancel = c;
    });
    return {
      cancel,
      token,
    };
  }
}
