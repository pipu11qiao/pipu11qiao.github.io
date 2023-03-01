# async await 原理

## 前言

async/await，async/await是一个很重要的语法糖，他的作用是用同步的方式，执行异步操作。那么今天我就带大家一起实现一下async/await吧！！！


## async await用法

总结
总结一下async/await的知识点
await只能在async函数中使用，不然会报错
async函数返回的是一个Promise对象，有无值看有无return值
await后面最好是接Promise，虽然接其他值也能达到排队效果
async/await作用是用同步方式，执行异步操作

## generator函数

### 基本用法

generator函数跟普通函数在写法上的区别就是，多了一个星号*，并且只有在generator函数中才能使用yield，什么是yield呢，他相当于generator函数执行的中途暂停点，比如下方有3个暂停点。而怎么才能暂停后继续走呢？那就得使用到next方法，next方法执行后会返回一个对象，对象中有value 和 done两个属性

* value：暂停点后面接的值，也就是yield后面接的值
* done：是否generator函数已走完，没走完为false，走完为true

```javascript
function* gen(){
  yield 1
  yield 2
  yield 3
}


const g = gen();

console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: undefined, done: true }
```
可以看到最后一个是undefined，这取决于你generator函数有无返回值

```
function* gen() {
  yield 1
  yield 2
  yield 3
  return 4
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: 4, done: true }
```
### yield后面接函数
yield后面接函数的话，到了对应暂停点yield，会马上执行此函数，并且该函数的执行返回值，会被当做此暂停点对象的value

```javascript
function fn(num) {
  console.log(num)
  return num
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) 
// 1
// { value: 1, done: false }
console.log(g.next())
// 2
//  { value: 2, done: false }
console.log(g.next()) 
// { value: 3, done: true }

```

### yield后面接Promise

前面说了，函数执行返回值会当做暂停点对象的value值，那么下面例子就可以理解了，前两个的value都是pending状态的Promise对象

```javascript
function fn(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: 3, done: true }
```
其实我们想要的结果是，两个Promise的结果1 和 2，那怎么做呢？很简单，使用Promise的then方法就行了
```javascript
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后输出 { value: Promise { 1 }, done: false }
  console.log(res1) // 1秒后输出 1

  const next2 = g.next()
  next2.value.then(res2 => {
    console.log(next2) // 2秒后输出 { value: Promise { 2 }, done: false }
    console.log(res2) // 2秒后输出 2
    console.log(g.next()) // 2秒后输出 { value: 3, done: true }
  })
})
```
next函数传参

generator函数可以用next方法来传参，并且可以通过yield来接收这个参数，注意两点

* 第一次next传参是没用的，只有从第二次开始next传参才有用
* next传值时，要记住顺序是，先右边yield，后左边接收参数
```javascript
function* gen() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g.next(22222)) 
// 22222
// { value: 3, done: true }
```
### Promise+next传参
前面讲了

yield后面接Promise
next函数传参
那这两个组合起来会是什么样呢？

```
function fn(nums) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nums * 2);
    }, 1000);
  });
}
function* gen() {
  const num1 = yield fn(1);
  const num2 = yield fn(num1);
  const num3 = yield fn(num2);
  return num3;
}

const g = gen();
const next1 = g.next();

next1.value.then((res1) => {
  const next2 = g.next(res1);
  next2.value.then((res2) => {
    const next3 = g.next(res2);
    next3.value.then((res3) => {
      g.next(res3);
    });
  });
});
```

## 实现async/await

其实上方的generator函数的Promise+next传参，就很像async/await了，区别在于

* gen函数执行返回值不是Promise，asyncFn执行返回值是Promise
* gen函数需要执行相应的操作，才能等同于asyncFn的排队效果
* gen函数执行的操作是不完善的，因为并不确定有几个yield，不确定会嵌套几次

```javascript
function generatorToAsync(generatorFn) {
  return function() {
    const gen = generatorFn.apply(this, arguments) // gen有可能传参

    // 返回一个Promise
    return new Promise((resolve, reject) => {

      function go(key, arg) {
        let res
        try {
          res = gen[key](arg) // 这里有可能会执行返回reject状态的Promise
        } catch (error) {
          return reject(error) // 报错的话会走catch，直接reject
        }

        // 解构获得value和done
        const { value, done } = res
        if (done) {
          // 如果done为true，说明走完了，进行resolve(value)
          return resolve(value)
        } else {
          // 如果done为false，说明没走完，还得继续走

          // value有可能是：常量，Promise，Promise有可能是成功或者失败
          return Promise.resolve(value).then(val => go('next', val), err => go('throw', err))
        }
      }

      go("next") // 第一次执行
    })
  }
}

const asyncFn = generatorToAsync(gen)

asyncFn().then(res => console.log(res))
```