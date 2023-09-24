const data = {
  count: 0,
  text: 'hello',
  person: {
    name: 'xioahong',
    age: 23,
  },
};
const getProxy = (taget, hanlder) => new Proxy(taget, hanlder);
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

const proData = new Proxy(data, hanlder);
function proxyData(data) {
  return;
}

proData.count = 1;
delete proData.text;
proData.person.age = 3;
