const isObject = (x) => typeof x === 'object' && x !== null;
const canProxy = (x) => {
  return typeof x === 'object' && x !== null;
};


const proxyStateMap = new WeakMap(); // <ProxyObject, ProxyState>
export const proxyFunction = (initialObject) => {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));

  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        console.log(['delete', [prop], prevValue]);
      }
      return deleted;
    },
    set(target, prop, value, receiver) {
      const hasPrevValue = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrevValue && prevValue === value) {
        return true;
      }
      let nextValue = value;
      if (!proxyStateMap.has(value) && canProxy(value)) {
        nextValue = proxyFunction(value);
      }
      Reflect.set(target, prop, nextValue, receiver);
      console.log(['set', [prop], value, prevValue]);
      return true;
    },
  };
  // debugger;
  const proxyObject = new Proxy(baseObject, handler);
  const proxyState = [baseObject];
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
