### useLatest 优雅的使用 返回当前最新值的 Hook，可以避免闭包问题。

#### 使用
在使用的时候是获取的ref
#### 源码分析
```javascript
import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export default useLatest;

```
通过将新的value值赋值给ref.current 来保证ref中的值是最新的


#### 依赖



