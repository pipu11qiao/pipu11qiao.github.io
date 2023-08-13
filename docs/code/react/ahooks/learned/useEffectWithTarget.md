# 熟悉ahooks提高开发效率



### useEventListener 优雅的使用 addEventListener。

#### 使用

普通使用，使用分页的接口，结合元素使用，

#### 源码分析

通过useEffectWithTarget方法来实现了时间的绑定和解绑

#### 依赖

useLatest,useEffectWithTarget

#### useEffectWithTarget 
其中使用了 createEffectWithTarget 使用useEffect或者useLayoutEffect自己封装了一个deps的方式，使用ref结合diff来实现的