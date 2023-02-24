# js常见编程题

## call、apply和bind

#### apply
```javascript
Function.prototype.myApply = function (_this, args) {
  // let fun = this;
  if (!_this) {
    _this = Object.create(null);
  }
  _this.fn = this;
  let res = _this.fn(...args);
  delete _this.fn;
  return res;
};
```

#### bind

```javascript
Function.prototype.myBind = function (_this, ...args) {
  let fun = this;
  return function F(...args2) {
    return this instanceof F
      ? new fun(...args, ...args2)
      : fun.apply(_this, [...args, ...args2]);
  };
};
```

## flat

### 通过字符串去掉[]的方式

```
function flat(arr) {
  let str = JSON.stringify(arr);
  str = str.replace(/[\[\]]/g, "");
  return JSON.parse("[" + str + "]");
}
```
### 递归或者非递归(栈)

``` javascript
function flat(arr) {
  function walk(nums, res) {
    for (let i = 0; i < nums.length; i++) {
      let cur = nums[i];
      if (Array.isArray(cur)) {
        walk(cur, res);
      } else {
        res.push(cur);
      }
    }
    return res;
  }
  return walk(arr, []);
}
function flat(arr) {
  let stack = [arr];
  let res = [];
  while (stack.length) {
    let cur = stack.pop();
    if (Array.isArray(cur)) {
      for (let i = cur.length - 1; i >= 0; i--) {
        stack.push(cur[i]);
      }
    } else {
      res.push(cur);
    }
  }
  return res;
}

```

## 节流、防抖

#### 防抖
```javascript
function debounce(fun, interval) {
  let timing = null;
  return function () {
    if (timing) {
      clearTimeout(timing);
    }
    let _this = this;
    let _arg = [...arguments];
    timing = setTimeout(function () {
      fun.apply(_this, _arg);
    }, interval);
  };
}
```
#### 节流

```javascript
function throttle(fun, interval) {
  let timing = null;
  let prev = 0;
  let prevFun = null;
  return function () {
    if (timing) {
      clearTimeout(timing);
    }
    let _this = this;
    let _arg = [...arguments];
    let _interval = interval;
    if (prevFun) {
      _interval = interval - (Date.now() - prev);
    }
    prevFun = fun;
    prev = Date.now();
    timing = setTimeout(function () {
      fun.apply(_this, _arg);
      if (timing) {
        clearTimeout(timing);
      }
      prevFun = null;
    }, _interval);
  };
}
```

## crreateRequest

```javascript
function createRequest(config = {}) {
  const { pool } = config;
  let stack = [];
  let wait = [];
  function check(p) {
    stack = stack.filter((item) => item !== p);
    if (wait.length > 0) {
      let infoObj = wait.shift();
      const { path, info, resolve, reject } = infoObj;
      let x = selfFetch(path, info)
        .then(resolve, reject)
        .finally(() => {
          check(x);
        });
      stack.push(x);
    }
  }

  return function (path, info) {
    return new Promise((resolve, reject) => {
      if (stack.length < pool) {
        let p = selfFetch(path, info)
          .then(resolve, reject)
          .finally(() => {
            check(p);
          });
        stack.push(p);
      } else {
        wait.push({
          path,
          info,
          resolve,
          reject,
        });
      }
    });
  };
}
```

## sendRequest

```javascript
async function sendRequest(urls, max, callback) {
  let res = [];
  let len = urls.length;
  let finishedCount = 0;
  let index = 0;
  async function getUrl(url, curIndex) {
    let cur = await myFetch(url);
    res[curIndex] = cur;
    finishedCount++;
    if (finishedCount === len) {
      callback(res);
    }
    if (index < len) {
      getUrl(urls[index], index);
      index++;
    }
  }
  for (let i = 0; i < len && i < max; i++) {
    getUrl(urls[i], i);
    index++;
  }
}
```

## 模版引擎

```javascript
// 第四版
function tmpl(str, data) {
    var str = document.getElementById(str).innerHTML;

    var fn = new Function("obj",

    "var p = []; with(obj){p.push('" +

    str
    .replace(/[\r\t\n]/g, "")
    .replace(/<%=(.*?)%>/g, "');p.push($1);p.push('")
    .replace(/<%/g, "');")
    .replace(/%>/g,"p.push('")
    + "');}return p.join('');");

    var template = function(data) {
        return fn.call(this, data)
    }
    return template;
};

// 使用时
var compiled = tmpl("user_tmpl");
results.innerHTML = compiled(data);
```


## new 函数

```javascript
function myNew(...args) {
  const Constructor = args[0];
  const o = Object.create(Constructor.prototype);
  let res = Constructor.apply(o, args.slice(1));
  return res instanceof Object ? res : o;
}
```


## promise

```javascript
let STATUS = {
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  REJECTED: "REJECTED",
};
function Promise(executor) {
  this.status = STATUS.PENDING;
  this.value = null;
  this.reason = null;
  this.onFulfilled = [];
  this.onRejected = [];
  let self = this;
  function resolve(value) {
    if (self.status !== STATUS.PENDING) {
      return;
    }
    self.value = value;
    self.status = STATUS.FULFILLED;
    self.onFulfilled.forEach((fn) => fn());
  }
  function reject(reason) {
    if (self.status !== STATUS.PENDING) {
      return;
    }
    self.reason = reason;
    self.status = STATUS.REJECTED;

    self.onRejected.forEach((fn) => fn());
  }
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (value) => value;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (reason) => {
          throw reason;
        };
  let self = this;
  let promise2 = new Promise((resolve, reject) => {
    if (self.status === STATUS.FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    } else if (self.status === STATUS.REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      self.onFulfilled.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
      self.onRejected.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  });
  return promise2;
};

function resolvePromise(promise2, x, resolve, reject) {
  let self = this;

  if (promise2 === x) {
    reject(new TypeError("chaining cycle"));
  }
  if (x && (typeof x === "object" || typeof x === "function")) {
    let used;
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (used) return;
            used = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
      } else {
        if (used) return;
        used = true;
        reject(x);
      }
    } catch (e) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
```

## 柯里化 curry

```javscript
function curryWrap(fn) {
  let paramCount = fn.length; // 参数个数
  let params = [];
  return function fun1(param) {
    params.push(param);
    if (params.length >= paramCount) {
      return fn.apply(this, params);
    } else {
      return fun1;
    }
  };
}
```