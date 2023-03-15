let p = {};

p.a = 1;
p.b = undefined;
delete p.b;

for (let key in p) {
  console.log(`key`, key);
}

// let arr = [];
// arr.push(3);
// arr.length = 0;
// console.log(`arr`, arr);
