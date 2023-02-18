# koa 

koa有两个知识点： 一个是中间ctx,一个是洋葱模型

中间件ctx利用js原型，很巧妙的把request和response对象封装在里面。

## 中间件ctx

```javascript
createContext(req, res) {
    let ctx = this.context
    // 原生req/res
    ctx.req = req // ctx.req.url
    ctx.res = res

    ctx.request = this.request // ctx.request.url
    ctx.response = this.response

    ctx.request.req = req // ctx.request.req.url
    ctx.response.res = res

    return ctx
}
```
## 洋葱模型

### 1.认识洋葱模型

```javascript
const Koa = require('koa');

const app = new Koa();
const PORT = 3000;

// #1
app.use(async (ctx, next)=>{
    console.log(1)
    await next();
    console.log(1)
});
// #2
app.use(async (ctx, next) => {
    console.log(2)
    await next();
    console.log(2)
})

app.use(async (ctx, next) => {
    console.log(3)
})

app.listen(PORT);
console.log(`http://localhost:${PORT}`);
```
> 打印 1 2 3 2 1 

### 2.原理

核心：中间件管理和next实现，其中next是巧妙的使用了Promise特性。洋葱模型，本质上是Promise.resolve()的递归。

app.listen使用了this.callback()来生成node的httpServer的回调函数。

```javascript
listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
}

```
Koa.js中间件引擎是有koa-compose模块，即如下的compose方法
```javascript
callback() {
    const fn = compose(this.middleware); // 核心：中间件的管理和next的实现
    
    if (!this.listeners('error').length) this.on('error', this.onerror);
    
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res); // 创建ctx
      return this.handleRequest(ctx, fn);
    };
    
    return handleRequest;
}

```
当我们app.use的时候，只是把方法存在了一个数组里
```javascript
use(fn) {
    this.middleware.push(fn);
    return this;
}

```

### 2.2 next实现
dispatch函数，它将遍历整个middleware，然后将context和dispatch(i + 1)传给middleware中的方法。

dispatch return Promise这段代码就很巧妙的实现了两点:

将context一路传下去给中间件
将middleware中的下一个中间件fn作为未来next的返回值
```javascript
function compose (middleware) {
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
          // 核心代码：返回Promise
          // next时，交给下一个dispatch（下一个中间件方法）
          // 同时，当前同步代码挂起，直到中间件全部完成后继续
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

## 3.思考

洋葱模型实现原理，等同于如下代码：

next()返回的是promise，需要使用await去等待promise的resolve值。

promise的嵌套就像是洋葱模型的形状就是一层包裹着一层，直到await到最里面一层的promise的resolve值返回。

```javascript
Promise.resolve(middleware1(context, async() => { // 注意async关键字不能省略
  return Promise.resolve(middleware2(context, async() => {
    return Promise.resolve(middleware3(context, async() => {
      return Promise.resolve();
    }));
  }));
}))
.then(() => {
    console.log('end');
});


```