import React from 'react';
// import produce from '../lib/index.js';
import produce from './produce.js';
console.log(`produce`, produce);

// const baseState = {
//   name: 'baseState',
//   size: 30,
//   person: {
//     age: 30,
//     box: {
//       width: 30,
//     },
//   },
// };
const baseState = {
  name: 'baseState',
  box: {
    width: 30,
    height: 40,
  },
  // person: {
  //   age: 30,
  //   box: {
  //     width: 30,
  //   },
  // },
};

const nextState1 = produce(baseState, (draftState) => {
  debugger;
  delete draftState.box.width;
});
console.log(`nextState1`, nextState1);
console.log(nextState1 === baseState);

// const nextState = produce(baseState, (draftState) => {
//   debugger;
//   draftState.person.box.width = 40;
// });

// console.log(`nextState`, nextState);

const TodoList = () => {
  return (
    <div>
      <h1>demo</h1>
    </div>
  );
};

export default TodoList;
