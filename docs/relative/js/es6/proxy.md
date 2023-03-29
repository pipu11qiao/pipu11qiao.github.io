## proxy

用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种元编程，即对编程语言进行编程

在目标对象之前假设一层拦截，外界对该对象的访问，都必须先通过这层拦截。

```javascript
const a = {
  name: "a",
  age: 20,
};

const aProxy = new Proxy(a, {
  get: function (target, propKey, receiver) {
    console.log(`getting ${propKey}!`);
    return Reflect.get(target, propKey, receiver);
  },
  set: function (target, propKey, value, receiver) {
    console.log(`setting ${propKey}!`);
    return Reflect.set(target, propKey, value, receiver);
  },
});
const obj1 = aProxy;

aProxy.age = 3;
const obj2 = aProxy;

console.log(obj1 === obj2);
```

# Proxy 和 Reflect

一个 Proxy 对象包装另一个对象并拦截诸如读取/写入属性和其他操作，可以选择自行处理它们，或者透明地允许该对象处理它们。

Proxy 被用于了许多库和某些浏览器框架。在本文中，我们将看到许多实际应用。

## Proxy

语法：

> let proxy = new Proxy(target, handler)

- target —— 是要包装的对象，可以是任何东西，包括函数。
- handler —— 代理配置：带有“捕捉器”（“traps”，即拦截操作的方法）的对象。比如 get 捕捉器用于读取 target 的属性，set 捕捉器用于写入 target 的属性，等等。

对 proxy 进行操作，如果在 handler 中存在相应的捕捉器，则它将运行，并且 Proxy 有机会对其进行处理，否则将直接对 target 进行处理。

首先，让我们创建一个没有任何捕捉器的代理（Proxy）：

```javascript
let target = {};
let proxy = new Proxy(target, {}); // 空的 handler 对象

proxy.test = 5; // 写入 proxy 对象 (1)
alert(target.test); // 5，test 属性出现在了 target 中！

alert(proxy.test); // 5，我们也可以从 proxy 对象读取它 (2)

for (let key in proxy) alert(key); // test，迭代也正常工作 (3)
```

由于没有捕捉器，所有对 proxy 的操作都直接转发给了 target。

1. 写入操作 proxy.test= 会将值写入 target。
2. 读取操作 proxy.test 会从 target 返回对应的值。
3. 迭代 proxy 会从 target 返回对应的值。

我们可以看到，没有任何捕捉器，proxy 是一个 target 的透明包装器（wrapper）。

Proxy 是一种特殊的“奇异对象（exotic object）”。它没有自己的属性。如果 handler 为空，则透明地将操作转发给 target。

要激活更多功能，让我们添加捕捉器。

我们可以用它们拦截什么？

对于对象的大多数操作，JavaScript 规范中有一个所谓的“内部方法”，它描述了最底层的工作方式。例如 [[Get]]，用于读取属性的内部方法，[[Set]]，用于写入属性的内部方法，等等。这些方法仅在规范中使用，我们不能直接通过方法名调用它们。

Proxy 捕捉器会拦截这些方法的调用。它们在 proxy 规范 和下表中被列出。

对于每个内部方法，此表中都有一个捕捉器：可用于添加到 new Proxy 的 handler 参数中以拦截操作的方法名称：

| 内部方法              | Handler 方法             | 何时触发                                                                                      |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| [[Get]]               | get                      | 读取属性                                                                                      |
| [[Set]]               | set                      | 写入属性                                                                                      |
| [[HasProperty]]       | has                      | in 操作符                                                                                     |
| [[Delete]]            | deleteProperty           | delete 操作符                                                                                 |
| [[Call]]              | apply                    | 函数调用                                                                                      |
| [[Construct]]         | construct                | new 操作符                                                                                    |
| [[GetPrototypeOf]]    | getPrototypeOf           | Object.getPrototypeOf                                                                         |
| [[SetPrototypeOf]]    | setPrototypeOf           | Object.setPrototypeOf                                                                         |
| [[IsExtensible]]      | isExtensible             | Object.isExtensible                                                                           |
| [[PreventExtensions]] | preventExtensions        | Object.preventExtensions                                                                      |
| [[DefineOwnProperty]] | defineProperty           | Object.defineProperty, Object.defineProperties                                                |
| [[GetOwnProperty]]    | getOwnPropertyDescriptor | Object.getOwnPropertyDescriptor, for..in, Object.keys/values/entries                          |
| [[OwnPropertyKeys]]   | ownKeys                  | Object.getOwnPropertyNames, Object.getOwnPropertySymbols, for..in, Object.keys/values/entries |

不变量（Invariant）
JavaScript 强制执行某些不变量 —— 内部方法和捕捉器必须满足的条件。

其中大多数用于返回值：

[[Set]] 如果值已成功写入，则必须返回 true，否则返回 false。
[[Delete]] 如果已成功删除该值，则必须返回 true，否则返回 false。
……依此类推，我们将在下面的示例中看到更多内容。

## 带有 “get” 捕捉器的默认值

最常见的捕捉器是用于读取/写入的属性。
要拦截读取操作，handler 应该有 get(target, property, receiver) 方法。
读取属性时触发该方法，参数如下：
* target —— 是目标对象，该对象被作为第一个参数传递给 new Proxy，
* property —— 目标属性名，
* receiver —— 如果目标属性是一个 getter 访问器属性，则 receiver 就是本次读取属性所在的 this 对象。通常，这就是 proxy 对象本身（或者，如果我们从 proxy 继承，则是从该 proxy 继承的对象）。现在我们不需要此参数，因此稍后我们将对其进行详细介绍。

让我们用 get 来实现一个对象的默认值。

我们将创建一个对不存在的数组项返回 0 的数组。

通常，当人们尝试获取不存在的数组项时，他们会得到 undefined，但是我们在这将常规数组包装到代理（proxy）中，以捕获读取操作，并在没有要读取的属性的时返回 0：

```javascript
let numbers = [0, 1, 2];

numbers = new Proxy(numbers, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    } else {
      return 0; // 默认值
    }
  }
});

alert( numbers[1] ); // 1
alert( numbers[123] ); // 0（没有这个数组项）
```
正如我们所看到的，使用 get 捕捉器很容易实现。

我们可以用 Proxy 来实现“默认”值的任何逻辑。

想象一下，我们有一本词典，上面有短语及其翻译：
```javascript
let dictionary = {
  'Hello': 'Hola',
  'Bye': 'Adiós'
};

alert( dictionary['Hello'] ); // Hola
alert( dictionary['Welcome'] ); // undefined

```
现在，如果没有我们要读取的短语，那么从 dictionary 读取它将返回 undefined。但实际上，返回一个未翻译的短语通常比 undefined 要好。因此，让我们在这种情况下返回一个未翻译的短语来替代 undefined。

为此，我们将把 dictionary 包装进一个拦截读取操作的代理：
```javascript

let dictionary = {
  'Hello': 'Hola',
  'Bye': 'Adiós'
};

dictionary = new Proxy(dictionary, {
  get(target, phrase) { // 拦截读取属性操作
    if (phrase in target) { //如果词典中有该短语
      return target[phrase]; // 返回其翻译
    } else {
      // 否则返回未翻译的短语
      return phrase;
    }
  }
});

// 在词典中查找任意短语！
// 最坏的情况也只是它们没有被翻译。
alert( dictionary['Hello'] ); // Hola
alert( dictionary['Welcome to Proxy']); // Welcome to Proxy（没有被翻译）
```
## 使用 “set” 捕捉器进行验证

假设我们想要一个专门用于数字的数组。如果添加了其他类型的值，则应该抛出一个错误。

当写入属性时 set 捕捉器被触发。

set(target, property, value, receiver)：

* target —— 是目标对象，该对象被作为第一个参数传递给 new Proxy，
* property —— 目标属性名称，
* value —— 目标属性的值，
* receiver —— 与 get 捕捉器类似，仅与 setter 访问器属性相关。
如果写入操作（setting）成功，set 捕捉器应该返回 true，否则返回 false（触发 TypeError）。

让我们用它来验证新值：
```javascript
let numbers = [];

numbers = new Proxy(numbers, { // (*)
  set(target, prop, val) { // 拦截写入属性操作
    if (typeof val == 'number') {
      target[prop] = val;
      return true;
    } else {
      return false;
    }
  }
});

numbers.push(1); // 添加成功
numbers.push(2); // 添加成功
alert("Length is: " + numbers.length); // 2

numbers.push("test"); // TypeError（proxy 的 'set' 返回 false）

alert("This line is never reached (error in the line above)");
```

请注意：数组的内建方法依然有效！值被使用 push 方法添加到数组。当值被添加到数组后，数组的 length 属性会自动增加。我们的代理对象 proxy 不会破坏任何东西。
我们不必重写诸如 push 和 unshift 等添加元素的数组方法，就可以在其中添加检查，因为在内部它们使用代理所拦截的 [[Set]] 操作。
因此，代码简洁明了。