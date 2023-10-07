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
  const notifyUpdate = (op) => {
    console.log(`op`, op);
  };
  const hanlders = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
      if (deleted) {
        notifyUpdate(['delete', [prop], prevValue]);
      }
      return res;
    },
    set(target, prop, value, receiver) {
      const hasPrev = Reflect.has(target, prop);
      const prevValue = Reflect.get(target, prop, receiver);
      if (hasPrev && prevValue === value) {
        return true;
      }
      let newValue = value;
      if (!proxyStateMap.get(value) && canProxy(value)) {
        // 可以被代理
        newValue = proxyFunction(value);
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
  const proxyObject = new Proxy(baseData, handler);
  const proxyState = [baseObject];
  proxyStateMap.set(proxyObject, proxyState);

  Object.keys(originData).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(originData, key);
    if ('value' in desc) {
      proxyData[key] = originData[key];
      delete desc.value;
      delete desc.writable;
    }
    Object.defineProperty(baseData, key, desc);
  });
  return proxyObject;
}
