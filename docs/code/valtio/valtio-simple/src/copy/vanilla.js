const isObject = (x) => typeof x === 'object' && x !== null;
const proxyStateMap = new WeakMap(); // <ProxyObject, ProxyState>
const refSet = new WeakSet();

const canProxy = (x) => {
  return typeof x === 'object' && x !== null;
};
const snapCache = new WeakMap();

const createSnapshot = (target, version) => {
  const cache = snapCache.get(target);
  if (cache?.[0] === version) {
    return cache[1];
  }
  const snap = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
  // markToTrack(snap, true); // mark to track

  snapCache.set(target, [version, snap]);
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
      desc.value = createSnapshot(target);
    }
    Object.defineProperty(snap, key, desc);
  });
  return Object.preventExtensions(snap);
};

const versionHolder = [1, 1];

const proxyFunction = (initialObject) => {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  let version = versionHolder[0];
  const listeners = new Set();
  const notifyUpdate = (op, nextVersion = ++version[0]) => {
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
      propProxyStates.forEach(([propProxyState]) => {
        const propVersion = propProxyState[1](nextCheckVersion);
        if (propVersion > version) {
          version = propVersion;
        }
      });
    }
    return version;
  };
  const createPropListener = (prop) => (op, nextVersion) => {
    const newOp = [...op];
    newOp[1] = [prop, ...newOp[1]];
    notifyUpdate(newOp, nextVersion);
  };
  const propProxyStates = new Map();
  const addPropListener = (prop, propProxyState) => {
    if (import.meta.env?.MODE !== 'production' && propProxyStates.has(prop)) {
      throw new Error('prop listener already exists');
    }
    if (listeners.size) {
      const remove = propProxyState[3](createPropListener(prop));
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
      propProxyStates.forEach(([propProxyState, prevRemove], prop) => {
        if (import.meta.env?.MODE !== 'production' && prevRemove) {
          throw new Error('remove already exists');
        }
        const remove = propProxyState[3](createPropListener(prop));
        propProxyStates.set(prop, [propProxyState, remove]);
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
  // debugger;
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject, ensureVersion, createSnapshot, addListener];
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
  return proxyObject;
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

export function subscribe(proxyObject, callback, notifyInSync) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  let promise;
  const ops = [];
  const addListener = proxyState;
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
export function snapshot(proxyObject) {
  const proxyState = proxyStateMap.get(proxyObject);
  if (import.meta.env?.MODE !== 'production' && !proxyState) {
    console.warn('Please use proxy object');
  }
  const [target, ensureVersion, createSnapshot] = proxyState;
  return createSnapshot(target, ensureVersion());
}
