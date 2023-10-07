function isObject(data) {
  return typeof data === 'object' && data !== null;
}

function canProxy(x) {
  return isObject(x);
}
const proxyStateMap = new WeakMap(); // <ProxyObject, ProxySate>

export function proxyFunction(data) {
  if (!isObject(data)) {
    throw new Error('need object');
  }
  const listeners = new Set();
  const notifyUpdate = (op) => {
    listeners.forEach((listener) => {
      listener(op);
    });
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
    const curAddListener = proxyState[1];
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
      propStateMap.forEach((propState, prop) => {
        addPropListener(prop, propState[1]);
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
      if (!proxyStateMap.get(value) && canProxy(value)) {
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
  const proxyState = [baseData, addListener];
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
  const remove = proxyState[1](newListener);
  proxyStateActive = true;

  return () => {
    proxyStateActive = false;
    remove();
  };
}
