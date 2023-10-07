// import { proxyFunction } from './handler';
// import { proxyFunction } from './exercise/exercise1';
// import { proxyFunction } from './exercise/exercise2';
// import { proxyFunction } from './exercise/exercise3';
// import { proxyFunction } from './exercise/exercise4';
// import { proxyFunction, subcribe } from './exercise/listener/listener1';
import { proxyFunction } from './exercise/listener/base';
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
console.log(`proData`, proData);
proData.count = 1;
console.log(`proData.count`, proData.count);
delete proData.text;
console.log(`proData.text`, proData.text);
proData.person.age = 3;
let pervPerson = proData.person;
console.log(`proData.person.age`, proData.person.age);
proData.person = 4;
pervPerson.age = 4;
export default {};
// subcribe(proData, (op) => {
//   console.log(`op`, op);
// });
// subcribe(proData, (op) => {
//   console.log(`op`, op);
// });

// proData.count = 1;
// delete proData.text;
// proData.person.age = 3;
// debugger
// proData.person.box.width = 5;
// // let pervPerson = proData.person;
// // proData.person = 4;
// // pervPerson.age = 4;
// export default {};
