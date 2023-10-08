function isObject(data) {
  return typeof data === 'object' && data !== null;
}

const proxyStateMap = new WeakMap(); // <ProxyObject, ProxySate>
const snapCache = new WeakMap();
const createSnapshot = (target, version) => {
  const cache = snapCache.get(target);
  if (cache?.[0] === version) {
    return cache[1];
  }
  const snap = Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
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
      desc.value = createSnapshot(target, version);
    }
    Object.defineProperty(snap, key, desc);
  });
  return Object.preventExtensions(snap);
};

const versionHolder = [1, 1];
export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
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
      propProxyStates.forEach(([propProxyState]) => {
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
  const propProxyStates = new Map(); // <prop,[proxyState,remove?]>
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
      propProxyStates.forEach(([proxyState, prevRemove], prop) => {
        if (import.meta.env?.MODE !== 'production' && prevRemove) {
          throw new Error('remove already exists');
        }
        const remove = proxyState[3](createPropListener(prop));
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
    set(target, prop, value, receiver) {
      const hasPrev = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrev && prevValue === value) {
        return true;
      }
      removePropListener(prop);
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
  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject, ensureVersion, createSnapshot, addListener];
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
  const addListener = proxyState[3];
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
  const snap = snapshot(proData);
  console.log(`op`, JSON.stringify(op));
  console.log(`snap`, JSON.stringify(snap));
});
proData.count = 1;
// delete proData.text;
proData.person.age = 3;
// unscribe();
// proData.person.box.width = 5;
export default {};
