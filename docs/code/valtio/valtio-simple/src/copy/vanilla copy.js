const proxyStateMap = new WeakMap(); // <ProxyObject, ProxyState>
const canProxy = (x) => {
  return typeof x === 'object' && x !== null;
};

const proxyFunction = (initialObject) => {
  if (typeof initialObject !== 'object') {
    throw new Error('object required');
  }
  const listeners = new Set();
  const notifyUpdate = (op) => {
    listeners.forEach((listener) => listener(op));
  };
  const createPropListener = (prop) => (op) => {
    const newOp = [...op];
    newOp = [prop, ...newOp[1]];
    notifyUpdate(newOp);
  };
  const propProxyStates = new Map();
  const addPropListener = (prop, proProxyState) => {
    if (import.meta.env.MODE !== 'production' && propProxyStates.has(prop)) {
      throw new Error('prop listener already exists');
    }
    if (listeners.size) {
      const remove = proProxyState[1](createPropListener(prop));
      propProxyStates.set(prop, [proProxyState, remove]);
    } else {
      propProxyStates.set(prop, [proProxyState]);
    }
  };

  const removePropListener = (prop) => {
    const entry = propProxyStates.get(prop);
    if (entry) {
      propProxyStates.delete(prop);
      entry[1]();
    }
  };
  const addListener = (listener) => {
    listener.add(listener);
    if (listeners.size === 1) {
      propProxyStates.forEach(([proProxyState, prevRemove], prop) => {
        if (import.meta.env?.MODE !== 'production' && prevRemove) {
          throw new Error('remove already exists');
        }
        const remove = proProxyState[3](createPropListener(prop));
        proProxyStates.set(prop, [proProxyState, remove]);
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
  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));
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
    set(target, prop, value, receiver) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrevValue && prevValue === value) {
        return true;
      }
      removePropListener(prop);
      let nextValue = value;
      if (value instanceof Promise) {
        value
          .then((v) => {
            value.status = 'fulfilled';
            value.value = v;
            notifyUpdate(['resolve', [prop], v]);
          })
          .catch((e) => {
            value.status = 'rejected';
            value.reason = e;
            notifyUpdate(['reject', [prop], e]);
          });
      } else {
        if (!proxyStateMap.has(value) && canProxy(value)) {
          nextValue = proxyFunction(value);
        }
        const childProxyState = proxyStateMap.get(nextValue);
        if (childProxyState) {
          addPropListener(prop, childProxyState);
        }
      }
      Reflect.set(target, prop, nextValue, receiver);
      notifyUpdate(['set', [prop], value, prevValue]);
      return true;
    },
  };
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject, addListener];
  proxyStateMap.set(proxyObject, proxyState);
  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(initialObject, key);
    if ('value' in desc) {
      proxyObject[key] = initialObject[key];
      // We need to delete desc.value because we already set it,
      // and delete desc.writable because we want to write it again.
      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseObject, key, desc);
  });
  return proxyState;
};
const buildProxyFunction = () => {
  return [
    // public functions
    proxyFunction,
    // internal
  ];
};

const [defaultProxyFunction] = buildProxyFunction();

export function proxy(initialObject) {
  return defaultProxyFunction(initialObject);
}

export function subcribe(proxyObject, callback, notifyInSync) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  let promise;
  const ops = [];
  const addListener = proxyState[1];
  let isListenerActive = false;
  const listener = (op) => {
    ops.push(op);
    if (notifyInSync) {
      callback(ops.splice(0));
      return;
    }
    if (!promise) {
      promise = Promise.resolve().then(() => {
        promise = undefined;
        if (isListenerActive) {
          callback(ops.splice(0));
        }
      });
    }
  };
  const removeListener = addListener(listener);
  isListenerActive = true;
  return () => {
    isListenerActive = false;
    removeListener();
  };
}
