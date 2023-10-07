
# 第一步拦截修改操作

第一步使用proxy拦截对象的修改操作，完成对修改的监听。包括set的deleteProperty两个handler

```javascript
const isObject = (x) => typeof x === 'object' && x !== null;

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
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
结果,可以看到只有对象的的原始类型的属性修改被拦截了。
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
这种写法存在问题，在初始后在修改应用类型的数据代理就需要重新设置，valtio中的巧妙的使用set代理函数在初始时进行设置，同时修改时也会给子属性添加代理。
```javascript
export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  const notifyUpdate = (op) => {
    console.log(`op`, op);
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
      if (!proxyStateMap.get(value) && canProxy(value)) {
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

到这里已经完成对对象的修改的监听，第二步建立监听函数

# 第二步添加通知

```javascript
function isObject(x) {
  return typeof x === 'object' && x !== null;
}
function canProxy(x) {
  return isObject(x);
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
      if (!proxyStateMap.get(value) && canProxy(value)) {
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
export function subcribe(proxyObject, callback) {
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

```

* 对于一个不包含子属性的对象来说，addListener函数已经足够使用了，通过添加listenr,在delete和set函数中触发。
* 如果是子属性是引用类型的数据
  * 在addListener函数中，会遍历propProxyStates,即是当前引用类型属性的map，拿到子属性的代理数据，proxyState,获取子代理对象的addListener方法，然后调用,形成了递归添加listener方法。data -> addListener  data.person -> addListener data.person.box -> addListener
  * 上面添加的listener都是通过createPropListener产生的，每个listener中都包含了自己的属性名，并且对子属性的改变添加了监听函数。`proData.person.box.width = 5`语句会触发，box得width修改
此时 op 为['set',['width'],5,3] 由proData.person.box代理对象中的listener触发,该函数会触发父对象中的监听函数
此时 op 为['set',['box','width'],5,3] 由proData.person代理对象中的listener触发
此时 op 为['set',['person','box','width'],5,3] 由proData代理对象中的listener触发