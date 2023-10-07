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
    listeners.forEach((listener) => {
      listener(op);
    });
  };
  const propProxyStates = new Map(); // <prop,proxyState>
  const createPropListener = (prop) => (op) => {
    const newOp = [...op];
    newOp[1] = [prop, ...newOp[1]];
    notifyUpdate(newOp);
  };
  const addPropListener = (prop, proxyState) => {
    if (listeners.size) {
      const remove = proxyState[1](createPropListener(prop));
      propProxyStates.set(prop, [proxyState, remove]);
    } else {
      propProxyStates.set(prop, [proxyState]);
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
        if (import.meta.mode !== 'production' && prevValue) {
          console.warn('has prev remove');
        }
        const remove = addPropListener(prop, proxyState);
        propProxyStates.set(prop, [proxyState, remove]);
      });
    }
    const removeListener = () => {
      listeners.remove(listener);
      if (listeners.size === 0) {
        propProxyStates.forEach(([proxyState, remove], prop) => {
          if (remove) {
            remove();
          }
          propProxyStates.set(prop, [proxyState]);
        });
      }
    };
    return removeListener;
  };
  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      removePropListener(prop);
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
export function subcribe(proxyObject, callback) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.mode !== 'production' && !proxyObject) {
    console.warn('need proxy data');
  }
  const addListener = proxyState[1];
  const ops = [];
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
