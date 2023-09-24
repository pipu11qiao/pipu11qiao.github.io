const data = {
  count: 0,
  text: 'hello',
  person: {
    name: 'xioahong',
    age: 23,
  },
};

const hanlder = {
  deleteProperty(target, prop) {
    console.log(`delete prop: ${prop}`);
    return Reflect.deleteProperty(target, prop);
  },
  set(target, prop, value) {
    console.log(`set prop: ${prop}, value: ${value}`);
    return Reflect.set(target, prop, value);
  },
};

const getProxy = (target, hanlder) => new Proxy(target, hanlder);
function getProxyData(data) {
  Object.keys(data).forEach((key) => {
    const item = data[key];
    if (typeof item === 'object') {
      data[key] = getProxyData(item);
    }
  });
  return getProxy(data, hanlder);
}

const proData = getProxyData(data);
proData.count = 1;
console.log(`proData.count`, proData.count);
delete proData.text;
console.log(`proData.text`, proData.text);
proData.person.age = 3;
console.log(`proData.person.age`, proData.person.age);
