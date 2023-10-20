import yayJpg from '../assets/yay.jpg';
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

export default function HomePage() {
  return (
    <div>
      <h2>Yay! Welcome to umi!</h2>
      <p>
        <img src={yayJpg} width="388" />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
