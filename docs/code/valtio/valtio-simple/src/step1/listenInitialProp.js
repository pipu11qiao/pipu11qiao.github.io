const isObject = (x) => typeof x === 'object' && x !== null;

export function proxyFunction(initialObject) {
  if (!isObject(initialObject)) {
    throw new Error('object required');
  }
  function notifyUpdate(op) {
    console.log(`op`, JSON.stringify(op));
  }
  const handler = {
    deleteProperty(target, prop) {
      const prevValue = Reflect.get(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);
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
      let nextValue = value;
      notifyUpdate(['set', [prop], nextValue, prevValue]);
      Reflect.set(target, prop, nextValue, reciever);
      return true;
    },
  };

  const proxyObject = new Proxy(initialObject, handler);
  return proxyObject;
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
proData.count = 1;
delete proData.text;
proData.person.age = 3;

export default {};
