// let user = {
//   name: "John",
//   age: 30,
//   _password: "***"
// };

// user = new Proxy(user, {
//   ownKeys(target) {
//     return Object.keys(target).filter(key => !key.startsWith('_'));
//   }
// });

// // "ownKeys" 过滤掉了 _password
// for(let key in user) console.log(key); // name，然后是 age

// // 对这些方法的效果相同：
// console.log( Object.keys(user) ); // name,age
// console.log( Object.values(user) ); // John,30
let user = { };

user = new Proxy(user, {
  ownKeys(target) { // 一旦要获取属性列表就会被调用
    return ['a', 'b', 'c'];
  },

  getOwnPropertyDescriptor(target, prop) { // 被每个属性调用
    return {
      enumerable: true,
      configurable: true
      /* ...其他标志，可能是 "value:..." */
    };
  }

});

console.log( Object.keys(user) ); // a, b, c