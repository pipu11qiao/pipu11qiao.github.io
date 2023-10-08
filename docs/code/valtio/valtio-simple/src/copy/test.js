// const arr = [];
// arr.push(3);
// // arr.push(4);
// // arr.push(5);
// console.log(arr.splice(0));

const obj = { name: 'a', size: 10 };

Object.defineProperty(obj, 'name', { writable: false });

obj.name = 33;


console.log(`obj.name`, obj.name);
