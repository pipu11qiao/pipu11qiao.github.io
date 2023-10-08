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
