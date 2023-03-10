# js知识点


## es5继承和es6继承的区别

区别：
* ES5的继承机制，是先创造一个独立的子类的实例对象，然后再将父类的方法添加到这个对象上面，即"实例在前,继承在后"。
* ES6的继承机制，则是先将父类的属性和方法加到一个空对象上面，然后再将该对象作为子类的实例，即"继承在前，实例在后"。
这也是为什么ES6的继承必须先调用super方法，因为这一步会生成一个继承父类的this的对象，没有这一步就无法继承父类。 （真的是牛鬼蛇神）

## var let const 区别

就像 let 一样，const 声明被提升到顶部但没有被初始化。

这三个声明方法有以下区别：

var 声明是全局作用域或函数作用域，而 let 和 const 是块作用域。
var 变量可以在其作用域内更新和重新声明；let 变量可以更新但不能重新声明；const 变量既不能更新也不能重新声明。
它们都被提升到了作用域的顶部。但是，var 变量是用 undefined 初始化的，而 let 和 const 变量不会被初始化。
var 和 let 可以在不初始化的情况下声明，而 const 必须在声明时初始化。
#### let 的提升
就像 var 一样，let 声明被提升到顶部。与初始化为 undefined 的 var 不同，let 关键字未初始化。所以如果你在声明之前尝试使用 let 变量，你会得到一个 Reference Error。

## 箭头函数和普通函数的区别

1、语法更加简洁、清晰
2、箭头函数不会创建自己的this（重要！！深入理解！！） 箭头函数没有自己的this，它会捕获自己在定义时（注意，是定义时，不是调用时）所处的外层执行环境的this，并继承这个this值。
3、箭头函数继承而来的this指向永远不变（重要！！深入理解！！）
4、.call()/.apply()/.bind()无法改变箭头函数中this的指向
5、箭头函数不能作为构造函数使用
6、箭头函数没有自己的arguments
7、箭头函数没有原型prototype
8、箭头函数不能用作Generator函数，不能使用yeild关键字

#### sort 总是用不对
The sort() method sorts the elements of an array in place and returns the sorted array. The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.

默认的排序方式是升序，将元素转为字符串，比较其utf-16的编码值

```javascript

const months = ['March', 'Jan', 'Feb', 'Dec'];
months.sort();
console.log(months);
// expected output: Array ["Dec", "Feb", "Jan", "March"]

const array1 = [1, 30, 4, 21, 100000];
array1.sort();
console.log(array1);
// expected output: Array [1, 100000, 21, 30, 4]

```

函数参数，compareFunction
函数返回值： 排序完的数组，注意是原来的数组也排序了

如果有比较函数，会根据比较函数的返回值进行排序。（所有的undefined 会排在最后，不会调用比较函数）

```javascript
const arr = [undefined,1,2,undefined,4,undefined,5];
arr.sort((a,b)=>{
  console.log('a b',a,b);
  return b-a;
});
console.log(arr)

/* 
a b 2 1
 a b 4 2
 a b 5 4
[5, 4, 2, 1, undefined, undefined, undefined]
*/
```

| compareFunction(a,b) return value | sort order |
|--|--|
| >0 | 把b排在a前| 
| <0 | 把b排在a后| 
| ===0 | a,b保持原位| 

大于0，b放前，小于0，b放后

# (1, eval)('this')  eval('this') 两者有什么不同 #

(1,eval)和普通的eval函数不同在于前者是一个值，后者是一个变量

(1,eval)是一个表达式，返回eval函数（就像（true&&eval） (0?0:eval)）,
Ecma 认为eval函数的引用调用eval是直接eval调用，但是表达式方式的eval调用是给非直接调用eval，非直接eval调用会在全局环境中调用

```javascript
var x = 'outer';
(function() {
  var x = 'inner';
  eval('console.log("direct call: " + x)'); 
  (1,eval)('console.log("indirect call: " + x)'); 
})();
```
[(1, eval)('this') vs eval('this') in JavaScript?](https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript)

