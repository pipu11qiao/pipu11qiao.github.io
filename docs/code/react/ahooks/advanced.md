## Advanced篇


* useControllableValue:在某些组件开发时，我们需要组件的状态既可以自己管理，也可以被外部控制，useControllableValue 就是帮你管理这种状态的 Hook。
* useCreation: useCreation 是 useMemo 或 useRef 的替代品。
* useEventEmitter: even bus
* useIsomorphicLayoutEffect 在 SSR 模式下，使用 useLayoutEffect 时，会出现以下警告
* useLatest 返回当前最新值的 Hook，可以避免闭包问题。
* useMemoizedFn: 持久化 function 的 Hook，理论上，可以使用 useMemoizedFn 完全代替 useCallback。
* useReactive: 提供一种数据响应式的操作体验，定义数据状态不需要写useState，直接修改属性即可刷新视图。

### 常用

* useLatest 返回当前最新值的 Hook，可以避免闭包问题。
* useControllableValue:在某些组件开发时，我们需要组件的状态既可以自己管理，也可以被外部控制，useControllableValue 就是帮你管理这种状态的 Hook。
* useCreation: useCreation 是 useMemo 或 useRef 的替代品。
* useMemoizedFn: 持久化 function 的 Hook，理论上，可以使用 useMemoizedFn 完全代替 useCallback。

### useCreation

而相比于 useRef，你可以使用 useCreation 创建一些常量，这些常量和 useRef 创建出来的 ref 有很多使用场景上的相似，但对于复杂常量的创建，useRef 却容易出现潜在的性能隐患。

const a = useRef(new Subject()); // 每次重渲染，都会执行实例化 Subject 的过程，即便这个实例立刻就被扔掉了
const b = useCreation(() => new Subject(), []); // 通过 factory 函数，可以避免性能隐患


### useMemoizedFn

持久化 function 的 Hook，理论上，可以使用 useMemoizedFn 完全代替 useCallback。

在某些场景中，我们需要使用 useCallback 来记住一个函数，但是在第二个参数 deps 变化时，会重新生成函数，导致函数地址变化。

const [state, setState] = useState('');

// 在 state 变化时，func 地址会变化
const func = useCallback(() => {
  console.log(state);
}, [state]);
使用 useMemoizedFn，可以省略第二个参数 deps，同时保证函数地址永远不会变化。


const [state, setState] = useState('');

// func 地址永远不会变化
const func = useMemoizedFn(() => {
  console.log(state);
});


地址变化捕获
```javascript
const ExpensiveTree = React.memo<{ [key: string]: any }>(({ showCount }) => {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  return (
    <div>
      <p>Render Count: {renderCountRef.current}</p>
      <button type="button" onClick={showCount}>
        showParentCount
      </button>
    </div>
  );
});
```

##### 源码解读

```javascript
import { useMemo, useRef } from 'react';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`);
    }
  }

  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current as T;
}

export default useMemoizedFn;

```

#### useReactive

提供一种数据响应式的操作体验，定义数据状态不需要写useState，直接修改属性即可刷新视图。

##### 源码解读
```javascript
import { useRef } from 'react';
import { isPlainObject } from 'lodash-es';
import useCreation from '../useCreation';
import useUpdate from '../useUpdate';

// k:v 原对象:代理过的对象
const proxyMap = new WeakMap();
// k:v 代理过的对象:原对象
const rawMap = new WeakMap();

function observer<T extends Record<string, any>>(initialVal: T, cb: () => void): T {
  const existingProxy = proxyMap.get(initialVal);

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy;
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal;
  }

  const proxy = new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);

      // https://github.com/alibaba/hooks/issues/1317
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      if (!descriptor?.configurable && !descriptor?.writable) {
        return res;
      }

      // Only proxy plain object or array,
      // otherwise it will cause: https://github.com/alibaba/hooks/issues/2080
      return isPlainObject(res) || Array.isArray(res) ? observer(res, cb) : res;
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb();
      return ret;
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb();
      return ret;
    },
  });

  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);

  return proxy;
}

function useReactive<S extends Record<string, any>>(initialState: S): S {
  const update = useUpdate();
  const stateRef = useRef<S>(initialState);

  const state = useCreation(() => {
    return observer(stateRef.current, () => {
      update();
    });
  }, []);

  return state;
}

export default useReactive;

```