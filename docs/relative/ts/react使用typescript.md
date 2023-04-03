# 如何优雅地在 React 中使用TypeScript



## 一 组件声明

在React中，组件的声明方式有两种：函数组件和类组件， 来看看这两种类型的组件声明时是如何定义TS类型的。

### 1. 类组件

类组件的定义形式有两种：React.Component<P, S={}> 和 React.PureComponent<P, S={} SS={}>，它们都是泛型接口，接收两个参数，第一个是props类型的定义，第二个是state类型的定义，这两个参数都不是必须的，没有时可以省略：
```typescript
import React from 'react';
interface IProps {
  name: string;
}

interface IState {
  count: number;
}

class Box extends React.Component<IProps, IState> {
  state = {
    count: 0,
  };
  render(): React.ReactNode {
    return (
      <div>
        {this.state.count}
        {this.props.name}
      </div>
    );
  }
}

export default Box;

```

React.PureComponent<P, S={} SS={}> 也是差不多的：

```typescript
class App extends React.PureComponent<IProps, IState> {}
```
React.PureComponent是有第三个参数的，它表示getSnapshotBeforeUpdate的返回值。
那PureComponent和Component 的区别是什么呢？它们的主要区别是PureComponent中的shouldComponentUpdate 是由自身进行处理的，不需要我们自己处理，所以PureComponent可以在一定程度上提升性能。

有时候可能会见到这种写法，实际上和上面的效果是一样的：
```typescript
import React, {PureComponent, Component} from "react";

class App extends PureComponent<IProps, IState> {}

class App extends Component<IProps, IState> {}

```

那如果定义时候我们不知道组件的props的类型，只有在调用时才知道组件类型，该怎么办呢？这时泛型就发挥作用了：

```typescript
// 定义组件
class MyComponent<P> extends React.Component<P> {
  internalProp: P;
  constructor(props: P) {
    super(props);
    this.internalProp = props;
  }
  render() {
    return (
    	 <span>hello world</span>
    );
  }
}

// 使用组件
type IProps = { name: string; age: number; };

<MyComponent<IProps> name="React" age={18} />;          // Success
<MyComponent<IProps> name="TypeScript" age="hello" />;  // Error
```

### 2. 函数式组件

通常情况下，函数组件我是这样写的：
```typescript
interface IProps {
  name: string
}

const App = (props: IProps) => {
  const {name} = props;

  return (
    <div className="App">
      <h1>hello world</h1>
      <h2>{name}</h2>
    </div>
  );
}

export default App;
```
通常情况下，函数组件我是这样写的：

```typescript
interface IProps {
  name: string
}

const App = (props: IProps) => {
  const {name} = props;

  return (
    <div className="App">
      <h1>hello world</h1>
      <h2>{name}</h2>
    </div>
  );
}

export default App;
```

除此之外，函数类型还可以使用React.FunctionComponent<P={}>来定义，也可以使用其简写React.FC<P={}>，两者效果是一样的。它是一个泛型接口，可以接收一个参数，参数表示props的类型，这个参数不是必须的。它们就相当于这样：

```typescript
type React.FC<P = {}> = React.FunctionComponent<P>
```

最终的定义形式如下：

```typescript
interface IProps {
  name: string
}

const App: React.FC<IProps> = (props) => {
  const {name} = props;
  return (
    <div className="App">
      <h1>hello world</h1>
      <h2>{name}</h2>
    </div>
  );
}

export default App;
```

当使用这种形式来定义函数组件时，props中默认不会带有children属性，它表示该组件在调用时，其内部的元素，来看一个例子，首先定义一个组件，组件中引入了Child1和Child2组件：
```typescript
import { PropsWithChildren } from 'react';

interface IProps {
  name: string;
}

const App: React.FC<PropsWithChildren<IProps>> = (props) => {
  const { name, children } = props;
  return (
    <div className="App">
      <h1>hello world</h1>
      <h2>{name}</h2>
      <div>{children}</div>
    </div>
  );
};

export default App;

```
使用 React.FC 声明函数组件和普通声明的区别如下：

React.FC 显式地定义了返回类型，其他方式是隐式推导的；
React.FC 对静态属性：displayName、propTypes、defaultProps 提供了类型检查和自动补全；


# 二 React 内置类型

### 1. JSX Element

```typescript
    namespace JSX {
        interface Element extends React.ReactElement<any, any> { }
    }
```
可以看到，JSX.Element是ReactElement的子类型，它没有增加属性，两者是等价的。也就是说两种类型的变量可以相互赋值。

JSX.Element 可以通过执行 React.createElement 或是转译 JSX 获得：
```typescript
const jsx = <div>hello</div>
const ele = React.createElement("div", null, "hello");
```
### 2. React.ReactElement
React 的类型声明文件中提供了 React.ReactElement＜T＞，它可以让我们通过传入＜T/＞来注解类组件的实例化，它在声明文件中的定义如下：
```typescript
interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
   type: T;
   props: P;
   key: Key | null;
}
```
ReactElement是一个接口，包含type,props,key三个属性值。该类型的变量值只能是两种： null 和 ReactElement实例。​

通常情况下，函数组件返回ReactElement（JXS.Element）的值。

### 3. React.ReactNode
ReactNode类型的声明如下：
```typescript
     */
    type ReactText = string | number;
    /**
     * @deprecated - This type is not relevant when using React. Inline the type instead to make the intent clear.
     */
    type ReactChild = ReactElement | string | number;

    /**
     * @deprecated Use either `ReactNode[]` if you need an array or `Iterable<ReactNode>` if its passed to a host component.
     */
    interface ReactNodeArray extends ReadonlyArray<ReactNode> {}
    type ReactFragment = Iterable<ReactNode>;
    type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
```

可以看到，ReactNode是一个联合类型，它可以是string、number、ReactElement、null、boolean、ReactNodeArray。由此可知。ReactElement类型的变量可以直接赋值给ReactNode类型的变量，但反过来是不行的。
类组件的 render 成员函数会返回 ReactNode 类型的值：

```typescript
class MyComponent extends React.Component {
	render() {
    	return <div>hello world</div>
    }
}
// 正确
const component: React.ReactNode<MyComponent> = <MyComponent />;
// 错误
const component: React.ReactNode<MyComponent> = <OtherComponent />;
```

### 4. CSSProperties

先来看看React的声明文件中对CSSProperties 的定义：

```typescript
    export interface CSSProperties extends CSS.Properties<string | number> {
        /**
         * The index signature was removed to enable closed typing for style
         * using CSSType. You're able to use type assertion or module augmentation
         * to add properties or an index signature of your own.
         *
         * For examples and more information, visit:
         * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
         */
    }
```
React.CSSProperties是React基于TypeScript定义的CSS属性类型，可以将一个方法的返回值设置为该类型
```typescript
import * as React from "react";

const classNames = require("./sidebar.css");

interface Props {
  isVisible: boolean;
}

const divStyle = (props: Props): React.CSSProperties => ({
  width: props.isVisible ? "23rem" : "0rem"
});

export const SidebarComponent: React.StatelessComponent<Props> = props => (
  <div id="mySidenav" className={classNames.sidenav} style={divStyle(props)}>
    {props.children}
  </div>
);
```
# 三 React Hooks

### 1. useState

默认情况下，React会为根据设置的state的初始值来自动推导state以及更新函数的类型：

如果已知state 的类型，可以通过以下形式来自定义state的类型：
```typescript
    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
    // convenience overload when first argument is omitted
    /**
     * Returns a stateful value, and a function to update it.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usestate
     */
    function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */
```
如果初始值为null，需要显式地声明 state 的类型：

```typescript
const [count, setCount] = useState<number | null>(null); 
```

如果state是一个对象，想要初始化一个空对象，可以使用断言来处理：
```typescript
const [user, setUser] = React.useState<IUser>({} as IUser);
```

### 2. useEffect

useEffect的主要作用就是处理副作用，它的第一个参数是一个函数，表示要清除副作用的操作，第二个参数是一组值，当这组值改变时，第一个参数的函数才会执行，这让我们可以控制何时运行函数来处理副作用：

```typescript
useEffect(
  () => {
    const subscription = props.source.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  },
  [props.source]
);
```
当函数的返回值不是函数或者effect函数中未定义的内容时，如下：

```typescript
useEffect(
    () => {
      subscribe();
      return null; 
    }
);
```
来看看useEffect在类型声明文件中的定义：

```typescript
// Destructors are only allowed to return void.
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };

// NOTE: callbacks are _only_ allowed to return either void, or a destructor.
type EffectCallback = () => (void | Destructor);

// TODO (TypeScript 3.0): ReadonlyArray<unknown>
type DependencyList = ReadonlyArray<any>;

function useEffect(effect: EffectCallback, deps?: DependencyList): void;
// NOTE: this does not accept strings, but this will have to be fixed by removing strings from type Ref<T>
  /**
   * `useImperativeHandle` customizes the instance value that is exposed to parent components when using
   * `ref`. As always, imperative code using refs should be avoided in most cases.
   *
   * `useImperativeHandle` should be used with `React.forwardRef`.
   *
   * @version 16.8.0
   * @see https://reactjs.org/docs/hooks-reference.html#useimperativehandle
   */
```
可以看到，useEffect的第一个参数只允许返回一个函数。

### 3. useRef

当使用 useRef 时，我们可以访问一个可变的引用对象。可以将初始值传递给 useRef，它用于初始化可变 ref 对象公开的当前属性。当我们使用useRef时，需要给其指定类型：
```typescript
    function useRef<T>(initialValue: T): MutableRefObject<T>;
    // convenience overload for refs given as a ref prop as they typically start with a null value
    /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     *
     * Usage note: if you need the result of useRef to be directly mutable, include `| null` in the type
     * of the generic argument.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useref
     */
    function useRef<T>(initialValue: T|null): RefObject<T>;
    // convenience overload for potentially undefined initialValue / call with 0 arguments
    // has a default to stop it from defaulting to {} instead
    /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useref
     */
    function useRef<T = undefined>(): MutableRefObject<T | undefined>;
    /**
     * The signature is identical to `useEffect`, but it fires synchronously after all DOM mutations.
     * Use this to read layout from the DOM and synchronously re-render. Updates scheduled inside
     * `useLayoutEffect` will be flushed synchronously, before the browser has a chance to paint.
     *
     * Prefer the standard `useEffect` when possible to avoid blocking visual updates.
     *
     * If you’re migrating code from a class component, `useLayoutEffect` fires in the same phase as
     * `componentDidMount` and `componentDidUpdate`.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#uselayouteffect
     */
```

```typescript
const nameInput = React.useRef<HTMLInputElement>(null)
```
这里给实例的类型指定为了input输入框类型。​

当useRef的初始值为null时，有两种创建的形式，第一种：

```typescript
const nameInput = React.useRef<HTMLInputElement>(null)
nameInput.current.innerText = "hello world";
```
这种形式下，ref1.current是只读的（read-only），所以当我们将它的innerText属性重新赋值时会报以下错误：

这段代码的第十行的告诉我们，如果需要useRef的直接可变，就需要在泛型参数中包含'| null'，所以这就是当初始值为null的第二种定义形式：

```typescript
  const nameInput = React.useRef<HTMLInputElement | null>(null);
  if (nameInput.current) {
    nameInput.current.innerText = 'hello world';
  }
```

### 4. useCallback
先来看看类型声明文件中对useCallback的定义：

```typescript
    function useCallback<T extends Function>(callback: T, deps: DependencyList): T;
    /**
     * `useMemo` will only recompute the memoized value when one of the `deps` has changed.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usememo
     */
    // allow undefined, but don't make it optional as that is very likely a mistake
```

### 5. useMemo

```typescript
    function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
    /**
     * `useDebugValue` can be used to display a label for custom hooks in React DevTools.
     *
     * NOTE: We don’t recommend adding debug values to every custom hook.
     * It’s most valuable for custom hooks that are part of shared libraries.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usedebugvalue
     */
    // the name of the custom hook is itself derived from the function name at runtime:
    // it's just the function name without the "use" prefix.
```

# 四、 事件处理

### 1. Event 事件类型

在开发中我们会经常在事件处理函数中使用event事件对象，比如在input框输入时实时获取输入的值；使用鼠标事件时，通过 clientX、clientY 获取当前指针的坐标等等。
​
我们知道，Event是一个对象，并且有很多属性，这时很多人就会把 event 类型定义为any，这样的话TypeScript就失去了它的意义，并不会对event事件进行静态检查，如果一个键盘事件触发了下面的方法，也不会报错：

```typescript
const handleEvent = (e: any) => {
    console.log(e.clientX, e.clientY)
}
```
由于Event事件对象中有很多的属性，所以我们也不方便把所有属性及其类型定义在一个interface中，所以React在声明文件中给我们提供了Event事件对象的类型声明。

常见的Event 事件对象如下：

* 剪切板事件对象：ClipboardEvent<T = Element>
* 拖拽事件对象：DragEvent<T = Element>
* 焦点事件对象：FocusEvent<T = Element>
* 表单事件对象：FormEvent<T = Element>
* Change事件对象：ChangeEvent<T = Element>
* 键盘事件对象：KeyboardEvent<T = Element>
* 鼠标事件对象：MouseEvent<T = Element, E = NativeMouseEvent>
* 触摸事件对象：TouchEvent<T = Element>
* 滚轮事件对象：WheelEvent<T = Element>
* 动画事件对象：AnimationEvent<T = Element>
* 过渡事件对象：TransitionEvent<T = Element>

可以看到，这些Event事件对象的泛型中都会接收一个Element元素的类型，这个类型就是我们绑定这个事件的标签元素的类型，标签元素类型将在下面的第五部分介绍。
```typescript
type State = {
  text: string;
};

const App: React.FC = () => {  
  const [text, setText] = useState<string>("")

  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setText(e.currentTarget.value);
  };
  
  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
    </div>
  );
}

```

这里就给onChange方法的事件对象定义为了FormEvent类型，并且作用的对象时一个HTMLInputElement类型的标签（input标签）
​
可以来看下MouseEvent事件对象和ChangeEvent事件对象的类型声明，其他事件对象的声明形似也类似：

```typescript
interface MouseEvent<T = Element, E = NativeMouseEvent> extends UIEvent<T, E> {
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  /**
    * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
    */
  getModifierState(key: string): boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
}

interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}
```

在很多事件对象的声明文件中都可以看到 EventTarget 的身影。这是因为，DOM的事件操作（监听和触发），都定义在EventTarget接口上。EventTarget 的类型声明如下：
```typescript

interface EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    dispatchEvent(evt: Event): boolean;
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}
```

比如在change事件中，会使用的e.target来获取当前的值，它的的类型就是EventTarget。来看下面的例子：

```typescript
<input
	onChange={e => onSourceChange(e)}
	placeholder="最多30个字"
/>

const onSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 30) {
      message.error('请长度不能超过30个字，请重新输入');
      return;
    }
    setSourceInput(e.target.value);
};
```

这里定义了一个input输入框，当触发onChange事件时，会调用onSourceChange方法，该方法的参数e的类型就是：React.ChangeEvent，而e.target的类型就是EventTarget：

### 2. 事件处理函数类型

说完事件对象类型，再来看看事件处理函数的类型。React也为我们提供了贴心的提供了事件处理函数的类型声明，来看看所有的事件处理函数的类型声明：

```typescript
type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];

type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;
// 剪切板事件处理函数
type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
// 复合事件处理函数
type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
// 拖拽事件处理函数
type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
// 焦点事件处理函数
type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
// 表单事件处理函数
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
// Change事件处理函数
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
// 键盘事件处理函数
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
// 鼠标事件处理函数
type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
// 触屏事件处理函数
type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
// 指针事件处理函数
type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
// 界面事件处理函数
type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
// 滚轮事件处理函数
type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
// 动画事件处理函数
type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
// 过渡事件处理函数
type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;
```

这里面的T的类型也都是Element，指的是触发该事件的HTML标签元素的类型，下面第五部分会介绍。
​
EventHandler会接收一个E，它表示事件处理函数中 Event 对象的类型。bivarianceHack 是事件处理函数的类型定义，函数接收一个 Event 对象，并且其类型为接收到的泛型变量 E 的类型, 返回值为 void。
​
还看上面的那个例子：
```typescript
type State = {
  text: string;
};

const App: React.FC = () => {  
  const [text, setText] = useState<string>("")

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setText(e.currentTarget.value);
  };
  
  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
    </div>
  );
}

```
这里给onChange方法定义了方法的类型，它是一个ChangeEventHandler的类型，并且作用的对象时一个HTMLImnputElement类型的标签（input标签）。

# 五、HTML标签类型

### 1. 常见标签类型

在项目的依赖文件中可以找到HTML标签相关的类型声明文件：


所有的HTML标签的类型都被定义在 intrinsicElements 接口中，常见的标签及其类型如下：
```typescript
a: HTMLAnchorElement;
body: HTMLBodyElement;
br: HTMLBRElement;
button: HTMLButtonElement;
div: HTMLDivElement;
h1: HTMLHeadingElement;
h2: HTMLHeadingElement;
h3: HTMLHeadingElement;
html: HTMLHtmlElement;
img: HTMLImageElement;
input: HTMLInputElement;
ul: HTMLUListElement;
li: HTMLLIElement;
link: HTMLLinkElement;
p: HTMLParagraphElement;
span: HTMLSpanElement;
style: HTMLStyleElement;
table: HTMLTableElement;
tbody: HTMLTableSectionElement;
video: HTMLVideoElement;
audio: HTMLAudioElement;
meta: HTMLMetaElement;
form: HTMLFormElement; 
```
那什么时候会使用到标签类型呢，上面第四部分的Event事件类型和事件处理函数类型中都使用到了标签的类型。上面的很多的类型都需要传入一个ELement类型的泛型参数，这个泛型参数就是对应的标签类型值，可以根据标签来选择对应的标签类型。这些类型都继承自HTMLElement类型，如果使用时对类型类型要求不高，可以直接写HTMLELement。比如下面的例子：
```typescript
<Button
	type="text"
	onClick={(e: React.MouseEvent<HTMLElement>) => {
  handleOperate();
  e.stopPropagation();
}}
  >
    <img
	src={cancelChangeIcon}
	alt=""
    />
    取消修改
</Button>
```

其实，在直接操作DOM时也会用到标签类型，虽然我们现在通常会使用框架来开发，但是有时候也避免不了直接操作DOM。比如我在工作中，项目中的某一部分组件是通过npm来引入的其他组的组件，而在很多时候，我有需要动态的去个性化这个组件的样式，最直接的办法就是通过原生JavaScript获取到DOM元素，来进行样式的修改，这时候就会用到标签类型。
​
```typescript
document.querySelectorAll('.paper').forEach(item => {
  const firstPageHasAddEle = (item.firstChild as HTMLDivElement).classList.contains('add-ele');
  
  if (firstPageHasAddEle) {
    item.removeChild(item.firstChild as ChildNode);
  }
})
```
这是我最近写的一段代码（略微删改），在第一页有个add-ele元素的时候就删除它。这里我们将item.firstChild断言成了HTMLDivElement类型，如果不断言，item.firstChild的类型就是ChildNode，而ChildNode类型中是不存在classList属性的，所以就就会报错，当我们把他断言成HTMLDivElement类型时，就不会报错了。很多时候，标签类型可以和断言（as）一起使用。
​
后面在removeChild时又使用了as断言，为什么呢？item.firstChild不是已经自动识别为ChildNode类型了吗？因为TS会认为，我们可能不能获取到类名为paper的元素，所以item.firstChild的类型就被推断为ChildNode | null，我们有时候比TS更懂我们定义的元素，知道页面一定存在paper 元素，所以可以直接将item.firstChild断言成ChildNode类型。

### 2. 标签属性类型

众所周知，每个HTML标签都有自己的属性，比如Input框就有value、width、placeholder、max-length等属性，下面是Input框的属性类型定义：

```typescript
interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string | undefined;
  alt?: string | undefined;
  autoComplete?: string | undefined;
  autoFocus?: boolean | undefined;
  capture?: boolean | string | undefined;
  checked?: boolean | undefined;
  crossOrigin?: string | undefined;
  disabled?: boolean | undefined;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined;
  form?: string | undefined;
  formAction?: string | undefined;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  height?: number | string | undefined;
  list?: string | undefined;
  max?: number | string | undefined;
  maxLength?: number | undefined;
  min?: number | string | undefined;
  minLength?: number | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  pattern?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  src?: string | undefined;
  step?: number | string | undefined;
  type?: string | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
  width?: number | string | undefined;

  onChange?: ChangeEventHandler<T> | undefined;
}
```
如果我们需要直接操作DOM，就可能会用到元素属性类型，常见的元素属性类型如下：
* HTML属性类型：HTMLAttributes
* 按钮属性类型：ButtonHTMLAttributes
* 表单属性类型：FormHTMLAttributes
* 图片属性类型：ImgHTMLAttributes
* 输入框属性类型：InputHTMLAttributes
* 链接属性类型：LinkHTMLAttributes
* meta属性类型：MetaHTMLAttributes
* 选择框属性类型：SelectHTMLAttributes
* 表格属性类型：TableHTMLAttributes
* 输入区属性类型：TextareaHTMLAttributes
* 视频属性类型：VideoHTMLAttributes
* SVG属性类型：SVGAttributes
* WebView属性类型：WebViewHTMLAttributes
一般情况下，我们是很少需要在项目中显式的去定义标签属性的类型。如果子级去封装组件库的话，这些属性就能发挥它们的作用了。来看例子（来源于网络，仅供学习）：
```typescript
import React from 'react';
import classNames from 'classnames'

export enum ButtonSize {
    Large = 'lg',
    Small = 'sm'
}

export enum ButtonType {
    Primary = 'primary',
    Default = 'default',
    Danger = 'danger',
    Link = 'link'
}

interface BaseButtonProps {
    className?: string;
    disabled?: boolean;
    size?: ButtonSize;
    btnType?: ButtonType;
    children: React.ReactNode;
    href?: string;    
}

type NativeButtonProps = BaseButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> // 使用 交叉类型（&） 获得我们自己定义的属性和原生 button 的属性
type AnchorButtonProps = BaseButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> // 使用 交叉类型（&） 获得我们自己定义的属性和原生 a标签 的属性

export type ButtonProps = Partial<NativeButtonProps & AnchorButtonProps> //使用 Partial<> 使两种属性可选

const Button: React.FC<ButtonProps> = (props) => {
    const { 
        disabled,
        className, 
        size,
        btnType,
        children,
        href,
        ...restProps  
    } = props;

    const classes = classNames('btn', className, {
        [`btn-${btnType}`]: btnType,
        [`btn-${size}`]: size,
        'disabled': (btnType === ButtonType.Link) && disabled  // 只有 a 标签才有 disabled 类名，button没有
    })

    if(btnType === ButtonType.Link && href) {
        return (
            <a 
            	className={classes}
            	href={href}
            	{...restProps}
            >
                {children}
            </a>
        )

    } else {
        return (
            <button 
            	className={classes}
            	disabled={disabled} // button元素默认有disabled属性，所以即便没给他设置样式也会和普通button有一定区别

            	{...restProps}
            >
                {children}
            </button>
        )
    }
}

Button.defaultProps = {
    disabled: false,
    btnType: ButtonType.Default
}

export default Button;
```
这段代码就是用来封装一个buttom按钮，在button的基础上添加了一些自定义属性，比如上面将button的类型使用交叉类型（&）获得自定义属性和原生 button 属性 ：
```typescript
type NativeButtonProps = BaseButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> 
```
# 六 工具泛型

在项目中使用一些工具泛型可以提高我们的开发效率，少写很多类型定义。下面来看看有哪些常见的工具泛型，以及其使用方式。

### 1. Partial 

Partial 作用是将传入的属性变为可选项。适用于对类型结构不明确的情况。它使用了两个关键字：keyof和in，先来看看他们都是什么含义。keyof 可以用来取得接口的所有 key 值：

```typescript
interface IPerson {
  name: string;
  age: number;
  height: number;
}
type T = keyof IPerson 
// T 类型为： "name" | "age" | "number"
```
in关键字可以遍历枚举类型：

```typescript
type Person = "name" | "age" | "number"
type Obj =  {
  [p in Keys]: any
} 
// Obj类型为： { name: any, age: any, number: any }
```
keyof 可以产生联合类型, in 可以遍历枚举类型, 所以经常一起使用, 下面是Partial工具泛型的定义：

```typescript
/**
 * Make all properties in T optional
 * 将T中的所有属性设置为可选
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

这里，keyof T 获取 T 所有属性名, 然后使用 in 进行遍历, 将值赋给 P, 最后 T[P] 取得相应属性的值。中间的?就用来将属性设置为可选。

使用示例如下：

```typescript
interface IPerson {
  name: string;
  age: number;
  height: number;
}

const person: Partial<IPerson> = {
  name: "zhangsan";
}
```
2. Required
Required 的作用是将传入的属性变为必选项，和上面的工具泛型恰好相反，其声明如下

```typescript
/**
 * Make all properties in T required
 * 将T中的所有属性设置为必选
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```
可以看到，这里使用-?将属性设置为必选，可以理解为减去问号。适用形式和上面的Partial差不多：
```typescript
interface IPerson {
  name?: string;
  age?: number;
  height?: number;
}

const person: Required<IPerson> = {
  name: "zhangsan";
  age: 18;
  height: 180;
}
```

### 3. Readonly
将T类型的所有属性设置为只读（readonly），构造出来类型的属性不能被再次赋值。Readonly的声明形式如下
```typescript
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

### 4. Pick<T, K extends keyof T>


从T类型中挑选部分属性K来构造新的类型。它的声明形式如下：
```typescript
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

使用示例如下：

```typescript
interface IPerson {
  name: string;
  age: number;
  height: number;
}

const person: Pick<IPerson, "name" | "age"> = {
  name: "zhangsan",
  age: 18
}
```

5. Record<K extends keyof any, T>

Record 用来构造一个类型，其属性名的类型为K，属性值的类型为T。这个工具泛型可用来将某个类型的属性映射到另一个类型上，下面是其声明形式：
```typescript

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

使用示例如下：

```typescript
interface IPageinfo {
    title: string;
}

type IPage = 'home' | 'about' | 'contact';

const page: Record<IPage, IPageinfo> = {
    about: {title: 'about'},
    contact: {title: 'contact'},
    home: {title: 'home'},
}
```
### 6. Exclude<T, U>