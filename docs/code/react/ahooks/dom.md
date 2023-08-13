## ahooks dom相关


* useEventListener：优雅的使用 addEventListener。
* useClickAway：监听目标元素外的点击事件。
* useDocumentVisibility：监听页面是否可见，参考 visibilityState API
* useDrop & useDrag：处理元素拖拽的 Hook。
* useEventTarget：常见表单控件(通过 e.target.value 获取表单值) 的 onChange 跟 value 逻辑封装，支持自定义值转换和重置功能。
* useExternal：动态注入 JS 或 CSS 资源，useExternal 可以保证资源全局唯一。
* useTitle：用于设置页面标题。
* useFavicon：设置页面的 favicon。
* useFullscreen：管理 DOM 全屏的 Hook。
* useHover：监听 DOM 元素是否有鼠标悬停。
* useMutationObserver：一个监听指定的 DOM 树发生变化的 Hook。
* useInViewport：观察元素是否在可见区域，以及元素可见比例。
* useKeyPress：监听键盘按键，支持组合键，支持按键别名。
* useLongPress：监听目标元素的长按事件。
* useMouse：监听鼠标位置。
* useResponsive：获取响应式信息。
* useScroll：监听元素的滚动位置。
* useSize：监听 DOM 节点尺寸变化的 Hook。
* useFocusWithin：监听当前焦点是否在某个区域之内，同 css 属性: focus-within。


### 建议常用
* useEventTarget
* useMouse
* useResponse
* useScroll
* useSize
* useFocusWithin


### 如何获取DOM元素

ahooks 大部分 DOM 类 Hooks 都会接收 target 参数，表示要处理的元素。
target 支持三种类型 React.MutableRefObject、HTMLElement、() => HTMLElement。

1. React.MutableRefObject
```javascript
export default () => {
  const ref = useRef(null)
  const isHovering = useHover(ref)
  return <div ref={ref}>{isHovering ? 'hover' : 'leaveHover'}</div>
}
```
2. HTMLElement
```javascript
export default () => {
  const isHovering = useHover(document.getElementById('test'))
  return <div id="test">{isHovering ? 'hover' : 'leaveHover'}</div>
}

```
3. 支持 () => HTMLElement，一般适用在 SSR 场景
```javascript
export default () => {
  const isHovering = useHover(() => document.getElementById('test'))
  return <div id="test">{isHovering ? 'hover' : 'leaveHover'}</div>
}

```
### getTargetElement

为了兼容以上三种类型入参，ahooks 封装了 getTargetElement - 获取目标 DOM 元素 方法。我们来看看代码做了什么：

1. 判断是否为浏览器环境，不是则返回 undefined
2. 判断目标元素是否为空，为空则返回函数参数指定的默认元素
3. 核心： 如果是函数，则返回函数执行后的结果 如果有 current 属性，则返回 .current属性的值，兼容 React.MutableRefObject 类型 以上都不是，则代表普通 DOM 元素，直接返回

### 监听 DOM 元素

#### target 支持动态变化
DOM 类 Hooks 的 target 是支持动态变化的，如下：
```javascript
export default () => {
  const [boolean, { toggle }] = useBoolean();

  const ref = useRef(null);
  const ref2 = useRef(null);

  const isHovering = useHover(boolean ? ref : ref2);
  return (
    <>
      <div ref={ref}>{isHovering ? 'hover' : 'leaveHover'}</div>
      <div ref={ref2}>{isHovering ? 'hover' : 'leaveHover'}</div>
    </>
  );
};
```
#### useEffectWithTarget createEffectWithTarget

useEffectWithTarget
```javascript
import { useEffect } from 'react'
import createEffectWithTarget from './createEffectWithTarget'

const useEffectWithTarget = createEffectWithTarget(useEffect)

export default useEffectWithTarget

```
createEffectWithTarget 接受参数 useEffect 或 useLayoutEffect，返回 useEffectWithTarget 函数
useEffectWithTarget 函数接收三个参数：前两个参数是 effect 和 deps（与 useEffect 参数一致），第三个参数则兼容了 DOM 元素的三种类型，可传 普通 DOM/ref 类型/函数类型


useEffectWithTarget 实现思路：

使用 useEffect/useLayoutEffect 监听，内部不传第二个参数依赖项，每次更新都会执行该副作用函数
通过 hasInitRef 判断是否是第一次执行，是则初始化：记录最后一次目标元素列表和依赖项，执行 effect 函数
由于该 useEffectType 函数体每次更新都会执行，所以每次都拿到最新的 targets 和 deps，所以后续执行可与第 2 点记录的最后一次的ref值进行比对
非首次执行：则判断元素列表长度或目标元素或者依赖发生变化，变化了则执行更新流程：执行上一次返回的卸载函数，更新最新值，重新执行 effect
组件卸载：执行 unLoadRef.current?.() 卸载函数，重置 hasInitRef

不使用useEffect的deps，而是使用器update的功能，进行记录(useRef)和比较(depsAreSame)来实现自定义的同时支持deps和target的useEffect

##### useEventListener 优雅的使用 addEventListener

* 通过useEffectWithTarget方法来实现了时间的绑定和解绑
* useLatest,useEffectWithTarget

##### useClickAway 监听目标元素外的点击事件

* 通过contains方法来判断出发的元素是否在目标元素内
ahooks 则继续拓展，思路如下：

同时支持传入 DOM 节点、Ref：需要区分是DOM节点、函数、还是Ref，获取的时候要兼顾所有情况
可传入多个目标元素（支持数组）：通过循环绑定事件，用数组some方法判断任一元素包含则触发
可指定监听事件（支持数组）：eventName 由外部传入，不传默认为 click 事件

来看看源码整体实现：

##### useDocumentVisibility

##### useDrop & useDrag

处理元素拖拽的 Hook。
useDrop 可以单独使用来接收文件、文字和网址的拖拽。
useDrag 允许一个 DOM 节点被拖拽，需要配合 useDrop 使用。
向节点内触发粘贴动作也会被视为拖拽。

* 通过useEffectWithTarget方法来实现了时间的绑定和解绑 dragenter dragover dragleave drop paste
  drop和paster中处理的放置的元素类型，html元素，文本，文件，链接。
  在 drop 和 paste 事件中，获取到 DataTransfer 数据并传给 onData 方法，根据数据类型进行特定的处理
DataTransfer：DataTransfer 对象用于保存拖动并放下（drag and drop）过程中的数据。它可以保存一项或多项数据，这些数据项可以是一种或者多种数据类型。关于拖放的更多信息，请参见 Drag and Drop
DataTransfer.getData()接受指定类型的拖放（以 DOMString 的形式）数据。如果拖放行为没有操作任何数据，会返回一个空字符串。数据类型有：text/plain，text/uri-list
DataTransferItem：拖拽项。

* useLatest,useEffectWithTarget

##### useEventTarget

这个实现比较简单，这里结尾代码有个as const，它表示强制 TypeScript 将变量或表达式的类型视为不可变的
```javascript
 return [
    value,
    {
      onChange,
      reset,
    },
  ] as const; // 将数组变为只读元组，可以确保其内容不会在其声明和函数调用之间发生变化
```

##### useFullscreen

```javascript

```

###### 原生全屏 API

Element.requestFullscreen()：用于发出异步请求使元素进入全屏模式
Document.exitFullscreen()：用于让当前文档退出全屏模式。调用这个方法会让文档回退到上一个调用 Element.requestFullscreen()方法进入全屏模式之前的状态
[已过时不建议使用]：Document.fullscreen：只读属性报告文档当前是否以全屏模式显示内容
Document.fullscreenElement：返回当前文档中正在以全屏模式显示的 Element 节点，如果没有使用全屏模式，则返回 null
Document.fullscreenEnabled：返回一个布尔值，表明浏览器是否支持全屏模式。全屏模式只在那些不包含窗口化的插件的页面中可用
fullscreenchange：元素过渡到或过渡到全屏模式时触发的全屏更改事件的事件
fullscreenerror：在 Element 过渡到或退出全屏模式发生错误后处理事件

###### screenfull 库
useFullscreen 内部主要是依赖 screenfull 这个库进行实现的。
screenfull 对各种浏览器全屏的 API 进行封装，兼容性好。
下面是该库的 API：

.request(element, options?)：使元素或者页面切换到全屏
.exit()：退出全屏
.toggle(element, options?)：在全屏和非全屏之间切换
.on(event, function)：添加一个监听器，监听全屏切换或者错误事件。event 支持 change 或者 error
.off(event, function)：移除之前注册的事件监听
.isFullscreen：判断是否为全屏
.isEnabled：判断当前环境是否支持全屏
.element：返回该元素是否是全屏模式展示，否则返回 undefined

##### useMutationObserver 一个监听指定的 DOM 树发生变化的 Hook

MutationObserver 接口提供了监视对 DOM 树所做更改的能力。利用 MutationObserver API 我们可以监视 DOM 的变化，比如节点的增加、减少、属性的变动、文本内容的变动等等。

##### useInViewport观察元素是否在可见区域，以及元素可见比例。

##### useResponsive 获取响应式信息。

```javascript
import React from 'react';
import { configResponsive, useResponsive } from 'ahooks';

configResponsive({
  small: 0,
  middle: 800,
  large: 1200,
});

export default function () {
  const responsive = useResponsive();
  return (
    <>
      <p>Please change the width of the browser window to see the effect: </p>
      {Object.keys(responsive).map((key) => (
        <p key={key}>
          {key} {responsive[key] ? '✔' : '✘'}
        </p>
      ))}
    </>
  );
}

```
##### useFocusWithin

###### :focus-within
:focus-within CSS 伪类表示当元素或其任意后代元素被聚焦时，将匹配该元素。换言之，它表示 :focus 伪类匹配到该元素自身或它的后代时，该伪类生效。（这也包括 shadow 树中的后代元素。）