import { proxy } from '@/lib';
type Data = {
  count: number;
  text: string;
  person: {
    age?: number;
    name: string;
  };
};
export const store = proxy<Data>({
  count: 0,
  text: 'hello',
  person: {
    age: 13,
    name: 'hha',
  },
});
// console.log(`store`, store);
// console.log(`store`, store);
// delete store.person.age;

export const actions = {
  add(num = 1) {
    store.count += num;
  },
  minus(num = 1) {
    store.count -= num;
  },
};
