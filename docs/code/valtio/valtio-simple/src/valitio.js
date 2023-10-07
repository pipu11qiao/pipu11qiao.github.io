// import { proxyFunction } from './handler';
// import { proxyFunction } from './exercise/exercise1';
// import { proxyFunction } from './exercise/exercise2';
// import { proxyFunction } from './exercise/exercise3';
// import { proxyFunction } from './exercise/exercise4';
// import { proxyFunction, subcribe } from './exercise/listener/listener2';
// import { proxyFunction, subcribe } from './exercise/listener/listener4';
// import { proxyFunction, subcribe } from './exercise/listener/listener5';

import { proxyFunction } from './exercise/baseProxy/exercise6';
const data = {
  count: 0,
  text: 'hello',
  person: {
    // name: 'xioahong',
    age: 23,
    // box: {
    //   width: 3,
    //   heigth: 4,
    // },
  },
};
const proData = proxyFunction(data);

// const unscribe = subcribe(proData, (op) => {
//   console.log(`op`, op);
// });

proData.count = 1;
delete proData.text;
// debugger;
proData.person.age = 3;
// unscribe();
// proData.person.box.width = 5;
// let pervPerson = proData.person;
// proData.person = 4;
// pervPerson.age = 4;
export default {};
