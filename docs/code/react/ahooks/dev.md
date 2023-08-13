## Dev篇——useTrackedEffect 和 useWhyDidYouUpdate


* useTrackedEffect:追踪是哪个依赖变化触发了 useEffect 的执行。
* useWhyDidYouUpdate: 帮助开发者排查是那个属性改变导致了组件的 rerender。

使用场景

检查哪些 props 发生改变
协助找出无效渲染：useWhyDidYouUpdate 会告诉我们监听数据中所有变化的数据，不管它是不是无效的更新，但还需要我们自己来区分识别哪些是无效更新的属性，从而进行优化。

实现思路

使用 useRef 声明 prevProps 变量（确保拿到最新值），用来保存上一次的 props
每次 useEffect 更新都置空 changedProps 对象，并将新旧 props 对象的属性提取出来，生成属性数组 allKeys
遍历 allKeys 数组，去对比新旧属性值。如果不同，则记录到 changedProps 对象中
如果 changedProps 有长度，则输出改变的内容，并更新 prevProps
