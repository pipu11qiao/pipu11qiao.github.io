## State篇


* useSetState 管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致。
* useBoolean 优雅的管理 boolean 状态的 Hook。
* useToggle useToggle
* useUrlState 通过 url query 来管理 state 的 Hook。
* useCookieState 一个可以将状态存储在 Cookie 中的 Hook 。
* useLocalStorageState 将状态存储在 localStorage 中的 Hook 
* useSessionStorageState 将状态存储在 sessionStorage 中的 Hook。
* useDebounce 用来处理防抖值的 Hook。
* useThrottle 用来处理节流值的 Hook。
* useMap 管理 Map 类型状态的 Hook。
* useSet 管理 Set 类型状态的 Hook。
* usePrevious 保存上一次状态的 Hook。
* useRafState 只在 requestAnimationFrame callback 时更新 state，一般用于性能优化。
* useSafeState 用法与 React.useState 完全一样，但是在组件卸载后异步回调内的 setState 不再执行，避免因组件卸载后更新状态而导致的内存泄漏。
* useGetState 给 React.useState 增加了一个 getter 方法，以获取当前最新值。
* useResetState  提供重置 state 方法的 Hooks，用法与 React.useState 基本一致。

### 常用

* useSetState 管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致。
* useToggle useToggle
* useUrlState 通过 url query 来管理 state 的 Hook。
* useDebounce 用来处理防抖值的 Hook。
* useThrottle 用来处理节流值的 Hook。
* useMap 管理 Map 类型状态的 Hook。
* useSet 管理 Set 类型状态的 Hook。
* usePrevious 保存上一次状态的 Hook。
* useRafState 只在 requestAnimationFrame callback 时更新 state，一般用于性能优化。
* useSafeState 用法与 React.useState 完全一样，但是在组件卸载后异步回调内的 setState 不再执行，避免因组件卸载后更新状态而导致的内存泄漏。
* useGetState 给 React.useState 增加了一个 getter 方法，以获取当前最新值。
* useResetState  提供重置 state 方法的 Hooks，用法与 React.useState 基本一致。
