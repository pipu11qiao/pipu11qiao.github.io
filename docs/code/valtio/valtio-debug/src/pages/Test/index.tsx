import { useSnapshot } from '@/lib';
import { store, actions } from './store';
console.log(`store`, store);

export default function Page() {
  // const state = useSnapshot(store);
  return (
    <div>
      {/* <div>{state.text}</div> */}
      {/* <div>count: {state.count}</div> */}
      {/* <button
        type="button"
        onClick={() => {
          actions.add();
        }}
      >
        add
      </button> */}
      <div>page</div>
    </div>
  );
}
