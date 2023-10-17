import React from 'react';
import produce from '../lib/index.js';

const baseState = {
  name: 'baseState',
  person: {
    age: 30,
    box: {
      width: 30,
    },
  },
};
const nextState1 = produce(baseState, (draftState) => {
    debugger;
  draftState.name = 'cccc';
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
