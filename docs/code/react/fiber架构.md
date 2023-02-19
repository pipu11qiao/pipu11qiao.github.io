## fiber 架构

react15 在 render 阶段的 reconcile 是不可打断的，这会在进行大量节点的 reconcile 时可能产生卡顿，因为浏览器所有的时间都交给了 js 执行，并且 js 的执行时单线程。为此 react16 之后就有了 scheduler 进行时间片的调度，给每个 task（工作单元）一定的时间，如果在这个时间内没执行完，也要交出执行权给浏览器进行绘制和重排，所以异步可中断的更新需要一定的数据结构在内存中来保存工作单元的信息，这个数据结构就是 Fiber。

那么有了 Fiber 这种数据结构后，能完成哪些事情呢，

- **工作单元 任务分解** ：Fiber 最重要的功能就是作为工作单元，保存原生节点或者组件节点对应信息（包括优先级），这些节点通过指针的形似形成 Fiber 树
- **增量渲染**：通过 jsx 对象和 current Fiber 的对比，生成最小的差异补丁，应用到真实节点上
- **根据优先级暂停、继续、排列优先级**：Fiber 节点上保存了优先级，能通过不同节点优先级的对比，达到任务的暂停、继续、排列优先级等能力，也为上层实现批量更新、Suspense 提供了基础
- **保存状态**: 因为 Fiber 能保存状态和更新的信息，所以就能实现函数组件的状态更新，也就是 hooks

### Fiber 的数据结构

Fiber 的自带属性如下：

```typescript
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 作为静态的数据结构 保存节点的信息
  this.tag = tag; // 对应的组件类型
  this.key = key; // key
  this.elementType = null; //元素类型
  this.type = null; //func或者class
  this.stateNode = null; //真是dom节点

  //作为fiber数架构 连接成fiber树
  this.return = null; //指向父节点
  this.child = null; //指向child
  this.sibling = null; //指向兄弟节点
  this.index = 0;

  this.ref = null;

  //用作为工作单元 来计算state
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  //effect相关
  this.effectTag = NoEffect;
  this.nextEffect = null;
  this.firstEffect = null;
  this.lastEffect = null;

  //优先级相关的属性
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  //current和workInProgress的指针
  this.alternate = null;
}
```

### Fiber 双缓存

现在我们知道了 Fiber 可以保存真实的 dom，真实 dom 对应在内存中的 Fiber 节点会形成 Fiber 树，这颗 Fiber 树在 react 中叫 current Fiber，也就是当前 dom 树对应的 Fiber 树，而正在构建 Fiber 树叫 workInProgress Fiber，这两颗树的节点通过 alternate 相连.

```javascript
function App() {
  return (
    <>
      <h1>
        <p>count</p> xiaochen
      </h1>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

构建 workInProgress Fiber 发生在 createWorkInProgress 中，它能创建或者服用 Fiber

```typescript
//ReactFiber.old.js
export function createWorkInProgress(current: Fiber, pendingProps: any): Fiber {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    //区分是在mount时还是在update时
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps; //复用属性
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;

    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;

    //...
  }

  workInProgress.childLanes = current.childLanes; //复用属性
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  const currentDependencies = current.dependencies;
  workInProgress.dependencies =
    currentDependencies === null
      ? null
      : {
          lanes: currentDependencies.lanes,
          firstContext: currentDependencies.firstContext,
        };

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}
```
* 在mount时：会创建fiberRoot和rootFiber，然后根据jsx对象创建Fiber节点，节点连接成current Fiber树。
![fiber-dom](./images//fiber-dom.jpg)