# BFC 理解

Block Formatting Contexts 直译为块级格式化上下文
具有BFC的特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且BFC具有普通容器所没有的一些特性。

通俗的理解BFC是一个大箱子，内部元素怎么改动不会影响外部。

## 触发BFC的条件

满足任意条件即可触发
* body 根元素:
* 浮动元素,float不为none
* overflow 除了visible 以外的值 hidden auto scroll
* display为inline-block table-cells flex table-caption
* 绝对定位 position absolute fixed

## BFC 布局规则 特性

1. 内部的Box会在垂直方向，一个接一个的放置。
2. Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻的margin会发生重叠
3. 每个元素的margin box的左边，与包含border box的左边相接触
4. BFC区域不会与float box重叠
5. BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。
6. 计算BFC的高度时，浮动元素也参与计算

## 特性应用

1. 自适应两栏布局
2. 可以阻止元素被浮动元素覆盖
3. 可以包含浮动元素-清除内部浮动
4. 分属于不同的BFC时可以阻止margin重叠

演示地址: [深入理解BFC](https://www.cnblogs.com/xiaohuochai/p/5248536.html)




### 参考链接
[[布局概念] 关于CSS-BFC深入理解](https://juejin.cn/post/6844903476774830094)
