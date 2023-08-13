## LifeCycle篇

* useUpdateEffect  用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行。
* useUpdateLayoutEffect 用法等同于 useLayoutEffect，但是会忽略首次执行，只在依赖更新时执行。
* useAsyncEffect useEffect 支持异步函数。
* useDebounceEffect 为 useEffect 增加防抖的能力。
* useDebounceFn 用来处理防抖函数的 Hook。
* useThrottleFn 用来处理函数节流的 Hook。
* useThrottleEffect 为 useEffect 增加节流的能力。
* useDeepCompareEffect 用法与 useEffect 一致，但 deps 通过 lodash isEqual 进行深比较。
* useDeepCompareLayoutEffect 用法与 useLayoutEffect 一致，但 deps 通过 lodash isEqual 进行深比较。
* useInterval 一个可以处理 setInterval 的 Hook。
* useRafInterval 用 requestAnimationFrame 模拟实现 setInterval，API 和 useInterval 保持一致，好处是可以在页面不渲染的时候停止执行定时器，比如页面隐藏或最小化等。
* useTimeout 一个可以处理 setTimeout 计时器函数的 Hook。
* useRafTimeout 用 requestAnimationFrame 模拟实现 setTimeout，API 和 useTimeout 保持一致，好处是可以在页面不渲染的时候不触发函数执行，比如页面隐藏或最小化等。
* useLockFn 用于给一个异步函数增加竞态锁，防止并发执行。
* useUpdate useUpdate 会返回一个函数，调用该函数会强制组件重新渲染

### 常用

* useAsyncEffect useEffect 支持异步函数。
* useInterval 一个可以处理 setInterval 的 Hook。
* useTimeout 一个可以处理 setTimeout 计时器函数的 Hook。
* useUpdate useUpdate 会返回一个函数，调用该函数会强制组件重新渲染
* useDebounceEffect 为 useEffect 增加防抖的能力。
* useThrottleEffect 为 useEffect 增加节流的能力。