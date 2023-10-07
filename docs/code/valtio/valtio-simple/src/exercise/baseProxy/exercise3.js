const isObject = (x) => typeof x === 'object' && x !== null;
const canProxy = (x) => {
  return typeof x === 'object' && x !== null;
};

const proxyStateMap = new WeakMap(); // <ProxyObject, ProxyState>

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  function notify(op, prop, value, prevValue) {
    console.log(`op,prop,value,prevValue`, op, prop, value, prevValue);
  }
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
      if (!proxyStateMap[value] && canProxy(value)) {
        nextValue = proxyFunction(value);
      }
      notify('set', prop, nextValue, prevValue);
      return Reflect.set(target, prop, nextValue, reciever);
    },
  };
  const baseObject = Array.isArray(initialObject)
    ? []
    : Object.create(Object.getPrototypeOf(initialObject));
  const proxyObject = new Proxy(baseObject, handler);

  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(initialObject, key);
    if ('value' in desc) {
      proxyObject[key] = initialObject[key];

      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseObject, key, desc);
  });
  const proxyState = [baseObject];
  proxyStateMap[proxyObject] = proxyState;
  return proxyObject;
}
