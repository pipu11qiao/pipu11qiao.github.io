#手写valtio中的vanilla代码

[valtio](https://github.com/pmndrs/valtio)是一个小巧的状态库，支持js和react，本文是手写js部分(valtio中最主要的部分)。手写valtio中的订阅和快照方法，深入理解valtio的实现。通过手写可以熟悉Proxy,Reflect,Object.defineProperty等一系列API的概念和使用方式

## 第一步拦截修改操作

第一步使用proxy拦截对象的修改操作，完成对修改的监听。包括set的deleteProperty两个handler,该步中需要掌握[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)和[Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)两个API的使用

```javascript
const isObject = (x) => typeof x === 'object' && x !== null;

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  ****}
  function notifyUpdate(op) {
    console.log(`op`, op);
  }
  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate(['delete', [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, reciever) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop);
      if (hasPrevValue && prevValue === value) {
        return true;
      }
      let nextValue = value;
      notifyUpdate(['set', [prop], nextValue, prevValue]);
      Reflect.set(target, prop, nextValue, reciever);
      return true;
    },
  };

  const proxyObject = new Proxy(initialObject, handler);
  return proxyObject;
}

const data = {
  count: 0,
  text: 'hello',
  person: {
    name: 'xioahong',
    age: 23,
    box: {
      width: 3,
      heigth: 4,
    },
  },
};
const proData = proxyFunction(data);
proData.count = 1;
delete proData.text;
proData.person.age = 3;

```
结果,可以看到只有对象的的原始类型的属性修改被拦截了。data得person属性的修改没有拦截到。
```css
op ["set",["count"],1,0]
op ["delete",["text"],"hello"]
```
如果属性是引用类型的数据没有被拦截,可以想到的办法是通过递归添加监听函数
```javascript
function proxyFunction(data) {
  Object.keys(data).forEach((key) => {
    const item = data[key];
    if (typeof item === 'object') {
      data[key] = proxyFunction(item);
    }
  });
  return new Proxy(data, hanlder);
}

```
**这种写法存在问题，在初始后在修改应用类型的数据代理就需要重新设置**，valtio中的巧妙的使用set代理函数在初始时进行设置，通过在初始时类似于克隆代理对象的方式，代理对象中的每个值，如果属性值是对象则会给子属性添加代理。
将proxyFunction改为下面的代码
```javascript
const proxyStateMap = new WeakMap();
export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  const notifyUpdate = (op) => {
    console.log(`op`, JSON.stringify(op));
  };
  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate(['delete', [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, reciever) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop);
      if (hasPrevValue && prevValue === value) {
        return true;
      }
      let nextValue = value;
      if (!proxyStateMap.get(value) && isObject(value)) {
        nextValue = proxyFunction(value);
      }
      Reflect.set(target, prop, nextValue, reciever);
      notifyUpdate(['set', [prop], value, prevValue]);
      return true;
    },
  };

  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject];
  proxyStateMap.set(proxyObject, proxyState);

  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(initialObject, key);
    if ('value' in desc) {
      proxyObject[key] = initialObject[key];
      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseObject, key, desc);
  });
  return proxyObject;
}
```
而且没有改变initialObject,通过对创建bseObject进行代理，进行一次克隆，并在克隆过程中对子属性进行设置。
结果
```css
op ["set",["count"],0,null]
op ["set",["text"],"hello",null]
op ["set",["name"],"xioahong",null]
op ["set",["age"],23,null]
op ["set",["width"],3,null]
op ["set",["heigth"],4,null]
op ["set",["box"],{"width":3,"heigth":4},null]
op ["set",["person"],{"name":"xioahong","age":23,"box":{"width":3,"heigth":4}},null]
op ["set",["count"],1,0]
op ["delete",["text"],"hello"]
op ["set",["age"],3,23]
```
可以看到最后的三行是操作代理对象出发的，其他行时进行初始时出发的，初始时也会触发通知函数后面会进行修复

到这里已经完成对对象的修改的监听，第二步建立监听函数

## 第二步添加通知

```javascript
function isObject(x) {
  return typeof x === 'object' && x !== null;
}
const proxyStateMap = new WeakMap(); // <ProxyObject, ProxySate>

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  const listeners = new Set();
  const notifyUpdate = (op) => {
    if (listeners.size) {
      listeners.forEach((listener) => listener(op));
    }
  };
  const createPropListener = (prop) => (op) => {
    const newOp = [...op];
    newOp[1] = [prop, ...newOp[1]]; // path
    notifyUpdate(newOp);
  };
  const propProxyStates = new Map(); // <prop, [proProxyState]>
  const addPropListener = (prop, propProxyState) => {
    if (import.meta.env?.MODE !== 'production' && propProxyStates.has(prop)) {
      throw new Error('prop listener already exists');
    }
    if (listeners.size) {
      const remove = propProxyState[1](createPropListener(prop));
      propProxyStates.set(prop, [propProxyState, remove]);
    } else {
      propProxyStates.set(prop, [propProxyState]);
    }
  };
  const removePropListener = (prop) => {
    const entry = propProxyStates.get(prop);
    if (entry) {
      propProxyStates.delete(prop);
      entry[1]?.();
    }
  };
  const addListener = (listener) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      propProxyStates.forEach(([proxyState, prevRemove], prop) => {
        if (import.meta.env?.MODE !== 'production' && prevRemove) {
          throw new Error('remove already exists');
        }
        const remove = proxyState[1](createPropListener(prop));
        propProxyStates.set(prop, [proxyState, remove]);
      });
    }
    const removeListener = () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        propProxyStates.forEach(([propProxyState, remove], prop) => {
          if (remove) {
            remove();
            propProxyStates.set(prop, [propProxyState]);
          }
        });
      }
    };
    return removeListener;
  };

  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      removePropListener(prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate(['delete', [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, reciever) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop);
      if (hasPrevValue && prevValue === value) {
        return true;
      }
      removePropListener(prop);
      let nextValue = value;
      if (!proxyStateMap.get(value) && isObject(value)) {
        nextValue = proxyFunction(value);
      }
      const childProxyState = proxyStateMap.get(nextValue);
      if (childProxyState) {
        addPropListener(prop, childProxyState);
      }
      Reflect.set(target, prop, nextValue, reciever);
      notifyUpdate(['set', [prop], value, prevValue]);
      return true;
    },
  };

  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject, addListener];
  proxyStateMap.set(proxyObject, proxyState);

  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(initialObject, key);
    if ('value' in desc) {
      proxyObject[key] = initialObject[key];
      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseObject, key, desc);
  });
  return proxyObject;
}
export function subscribe(proxyObject, callback) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  const ops = [];
  const addListener = proxyState[1];
  let isListenerActive = false;
  const listener = (op) => {
    ops.push(op);
    callback(ops.splice(0));
  };
  const removeListener = addListener(listener);
  isListenerActive = true;
  return () => {
    isListenerActive = false;
    removeListener();
  };
}

const data = {
  count: 0,
  text: 'hello',
  person: {
    name: 'xioahong',
    age: 23,
    box: {
      width: 3,
      heigth: 4,
    },
  },
};
const proData = proxyFunction(data);

const unscribe = subscribe(proData, (op) => {
  // const snap1 = snapshot(proData);
  // console.log(`snap1`, snap1);
  console.log(`op`, JSON.stringify(op));
});
proData.count = 1;
delete proData.text;
proData.person.age = 3;
// unscribe();
proData.person.box.width = 5;
export default {};

```

* 对于一个不包含子属性的对象来说，addListener函数已经足够使用了，通过添加listenr,在delete和set函数中触发。
* 如果是子属性是引用类型的数据
  * 在addListener函数中，会遍历propProxyStates,即是当前引用类型属性的map，拿到子属性的代理数据，proxyState,获取子代理对象的addListener方法，然后调用,形成了递归添加listener方法。data -> addListener  data.person -> addListener data.person.box -> addListener
  * 上面添加的listener都是通过createPropListener产生的，每个listener中都包含了自己的属性名，并且对子属性的改变添加了监听函数。`proData.person.box.width = 5`语句会触发，box得width修改
此时 op 为['set',['width'],5,3] 由proData.person.box代理对象中的listener触发,该函数会触发父对象中的监听函数
此时 op 为['set',['box','width'],5,3] 由proData.person代理对象中的listener触发
此时 op 为['set',['person','box','width'],5,3] 由proData代理对象中的listener触发

## 第三步 添加快照

快照就是对当前的数据对象进行复制，具体代码

```javascript
const createSnapshot = (target, version) => {
  const snap = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
  Reflect.ownKeys(target).forEach((key) => {
    if (Object.getOwnPropertyDescriptor(snap, key)) {
      // Only the known case is Array.length so far.
      return;
    }
    const value = Reflect.get(target, key);
    const desc = {
      value,
      enumerable: true,
      // This is intentional to avoid copying with proxy-compare.
      // It's still non-writable, so it avoids assigning a value.
      configurable: true,
    };
    if (proxyStateMap.has(value)) {
      const [target] = proxyStateMap.get(value);
      desc.value = createSnapshot(target, version);
    }
    Object.defineProperty(snap, key, desc);
  });
  return Object.preventExtensions(snap);
};
```

createSnapshot 返回一个不支持扩展(不支持赋值)的对象，可以认为是不可变数据。
在react的函数中快照方法会被频繁调用，所以在数据没有变化时通过缓存获取。valitio通过添加版本的机制来表示数据是否发生变化。

versionHolder得数据中保存了两个版本，第一个版本表示当前的数据版本，第二个版本表示检查的版本
ensureVersion 函数返回一个当前数据最新的版本version

```javascript
const versionHolder = [1, 1];
const proxyFunction = (initialObject) => {
  let version = versionHolder[0];
  const listeners = new Set();
  const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
    if (version !== nextVersion) {
      version = nextVersion;
      listeners.forEach((listener) => listener(op));
    }
  };
  let checkVersion = versionHolder[1];
  const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
    if (checkVersion !== nextCheckVersion && !listeners.size) {
      checkVersion = nextCheckVersion;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      propStateMap.forEach(([propProxyState]) => {
        const propVersion = propProxyState[1](nextCheckVersion);
        if (propVersion > version) {
          version = propVersion;
        }
      });
    }
    return version;
  };
  // 其他代码
  // ...
  // 返回的state中添加ensureVersion和createSnapshot方法
  const proxyState = [baseData, ensureVersion, createSnapshot, addListener];
}
  // 原来调用addListener的地方需要修改获取的方式
  export function subscribe(proxyObject, listener) {
  const remove = proxyState[3](newListener);// 原来是 proxyState[1]
  }

```

在createSnapshot方法中加入缓存功能

```javascript
const createSnapshot = (target, version) => {
  const cache = snapCache.get(target);
  if (cache?.[0] === version) {
    return cache[1];
  }
  const snap = //...
  snapCache.set(target, [version, snap]);
}
```

最后导出snapshot方法

```javascript
export function snapshot(proxyObject) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  const [target, ensureVersion, createSnapshot] = proxyState;
  return createSnapshot(target, ensureVersion());
}

```

## 完整的代码

```javascript
function isObject(data) {
  return typeof data === 'object' && data !== null;
}

const proxyStateMap = new WeakMap(); // <ProxyObject, ProxySate>
const snapCache = new WeakMap();
const createSnapshot = (target, version) => {
  const snap = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
  Reflect.ownKeys(target).forEach((key) => {
    if (Object.getOwnPropertyDescriptor(snap, key)) {
      // Only the known case is Array.length so far.
      return;
    }
    const value = Reflect.get(target, key);
    const desc = {
      value,
      enumerable: true,
      // This is intentional to avoid copying with proxy-compare.
      // It's still non-writable, so it avoids assigning a value.
      configurable: true,
    };
    if (proxyStateMap.has(value)) {
      const [target] = proxyStateMap.get(value);
      desc.value = createSnapshot(target, version);
    }
    Object.defineProperty(snap, key, desc);
  });
  return Object.preventExtensions(snap);
};

const versionHolder = [1, 1];
export function proxyFunction(data) {
  if (!isObject(data)) {
    throw new Error('need object');
  }
  let version = versionHolder[0];
  const listeners = new Set();
  const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
    if (version !== nextVersion) {
      version = nextVersion;
      listeners.forEach((listener) => listener(op));
    }
  };
  let checkVersion = versionHolder[1];
  const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
    if (checkVersion !== nextCheckVersion && !listeners.size) {
      checkVersion = nextCheckVersion;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      propStateMap.forEach(([propProxyState]) => {
        const propVersion = propProxyState[1](nextCheckVersion);
        if (propVersion > version) {
          version = propVersion;
        }
      });
    }
    return version;
  };
  const createPropListener = (prop) => (op) => {
    const newOp = [...op];
    newOp[1] = [prop, ...newOp[1]];
    notifyUpdate(newOp);
  };
  const propStateMap = new Map(); // <prop,[proxyState,remove?]>
  const addPropListener = (prop, proxyState) => {
    if (propStateMap.has(prop)) {
      return;
    }
    const curAddListener = proxyState[3];
    const remove = curAddListener(createPropListener(prop));
    propStateMap.set(prop, [proxyState, remove]);
  };
  const deletePropListener = (prop) => {
    if (!propStateMap.has(prop)) {
      return;
    }
    if (propStateMap[prop]) {
      const [_, remove] = propStateMap[prop];
      if (remove) {
        remove();
      }
      propStateMap.delete(prop);
    }
  };
  const addListener = (listener) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      propStateMap.forEach(([propProxyState], prop) => {
        const remove = propProxyState[3](createPropListener(prop));
        propStateMap.set(prop, [propProxyState, remove]);
      });
    }
    const removeListener = () => {
      listener.remove(listeners);
      if (listeners.size === 0) {
        propStateMap.forEach((propState, prop) => {
          if (propState[1]) {
            propState[1]();
            propStateMap.set(prop, [propState[0]]);
          }
        });
      }
    };
    return removeListener;
  };

  const hanlder = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      deletePropListener(prop);
      if (deleted) {
        notifyUpdate(['delete', [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, receiver) {
      const hasPrev = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrev && prevValue === value) {
        return true;
      }
      deletePropListener(prop);
      let newValue = value;
      if (!proxyStateMap.get(value) && isObject(value)) {
        // 可以被代理
        newValue = proxyFunction(value);
      }
      const childState = proxyStateMap.get(newValue);
      if (childState) {
        addPropListener(prop, childState);
      }
      let res = Reflect.set(target, prop, newValue, receiver);
      notifyUpdate(['set', [prop], newValue, prevValue]);
      return res;
    },
  };
  const originData = data;
  const baseData = Array.isArray(originData)
    ? []
    : Object.create(Object.getPrototypeOf(originData));
  const proxyObject = new Proxy(baseData, hanlder);
  const proxyState = [baseData, ensureVersion, createSnapshot, addListener];
  proxyStateMap.set(proxyObject, proxyState);

  Object.keys(originData).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(originData, key);
    if ('value' in desc) {
      proxyObject[key] = originData[key];
      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseData, key, desc);
  });
  return proxyObject;
}

export function subscribe(proxyObject, listener) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (!proxyState) {
    throw new Error('need proxy object');
  }

  const opList = [];
  let proxyStateActive = false;
  const newListener = (op) => {
    if (proxyStateActive) {
      opList.push(op);
      listener(opList.splice(0));
    }
  };
  const remove = proxyState[3](newListener);
  proxyStateActive = true;

  return () => {
    proxyStateActive = false;
    remove();
  };
}

export function snapshot(proxyObject) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  const [target, ensureVersion, createSnapshot] = proxyState;
  return createSnapshot(target, ensureVersion());
}

const data = {
  count: 0,
  text: 'hello',
  person: {
    name: 'xioahong',
    age: 23,
    box: {
      width: 3,
      heigth: 4,
    },
  },
};
const proData = proxyFunction(data);

const unscribe = subscribe(proData, (op) => {
  console.log(`op`, JSON.stringify(op));
  const snap = snapshot(proData);
  console.log(`snap1`, JSON.stringify(snap));
});
proData.count = 1;
// delete proData.text;
proData.person.age = 3;
// unscribe();
// proData.person.box.width = 5;
export default {};


```

结果

```javascript
op [["set",["count"],1,0]]
snap1 {"count":1,"text":"hello","person":{"name":"xioahong","age":23,"box":{"width":3,"heigth":4}}}
op [["set",["person","age"],3,23]]
snap1 {"count":1,"text":"hello","person":{"name":"xioahong","age":3,"box":{"width":3,"heigth":4}}}
op [["set",["person","age"],3,23]]
snap1 {"count":1,"text":"hello","person":{"name":"xioahong","age":3,"box":{"width":3,"heigth":4}}}

```