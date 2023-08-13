# 熟悉ahooks提高开发效率



### useInfiniteScroll 封装了常见的无限滚动逻辑
```javascript
const {data,loading,loadingMore,loadMore} = useInfiniteScroll(service)
```
参数service是一个异步函数，
1. service返回数据，包含list的数组
2. service的入参为整合之后的数据，其中属性list为合并之后的list数组
#### 使用
普通使用，使用分页的接口，结合元素使用，
#### 源码分析
请求部分是依靠 useRequest提供的功能 包括 run runAsync loading，cancel,error
封装了针对target的scroll时间的监听
#### 依赖
useEventListener,useMemoizedFn,useRequest,useUpdateEffect


