const isObject = (x) => typeof x === 'object' && x !== null;
const canProxy = (x) => {
  return typeof x === 'object' && x !== null;
};

const proxyStateMap = new WeakMap(); // <ProxyObject, ProxyState>

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  function notify(op, prop, value) {
    console.log(`op, prop, value`, op, prop, value);
  }
  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));

  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notify('delete', prop, prevValue);
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
      if (!proxyStateMap.has(value) && canProxy(value)) {
        nextValue = proxyFunction(value);
      }
      if (canProxy(value)) {
        const childState = proxyFunction(value);
      }
      notify('set', target, value, prevValue);
      Reflect.set(target, prop, nextValue, reciever);
      return true;
    },
  };

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
}
