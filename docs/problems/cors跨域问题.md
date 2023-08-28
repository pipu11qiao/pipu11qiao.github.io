# cors withCredentials 跨域的问题

项目node端使用的express+cors来解决跨域，前端使用axios.遇到的问题是前端设置withCredentials时会报跨域的错误

错误信息：
> select-page:1 Access to XMLHttpRequest at 'http://localhost:3080/search?name=aa' from origin 'http://localhost:8000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

axios设置：

```javascript
// 创建 axios 请求实例
const serviceAxios = axios.create({
  timeout: 5000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

express设置：

```javascript
import express from "express";
import cors from "cors";


const app = express();

app.use(
  cors({
    credentials: true,
  })
);
```

### 解决办法：

Access-Control-Allow-Origin不能是\*号 这样浏览器就不会拦截服务器设置的cookie了。

```javascript
app.use(
  cors({
    origin:true,// origin设置为true，就是会使用客户端的域名作为Access-Control-Allow-Origin的值
    credentials: true,
  })
);
```

### 回顾

这个问题花了很长的时间,在写这个文章的时候才发现浏览器的错误信息里面已经有很明确的提示了。

Access to XMLHttpRequest at 'http://localhost:3080/search?name=aa' from origin 'http://localhost:8000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

通过域名http://localhost:8000获取"http://localhost:3080/search?name=aa"的xhr被cors规则所中断。原因是预请求没有通过获取控制检测，当请求头中的credentials的模式为“include"时，响应头中的'Access-Control-Allow-Origin'必须不是通配符“*”。请求偷得credentials模式由xhr的withCredentials设置。

这样看来该问题就有两个解决方案：一个是服务端设置Access-Control-Allow-Origin时不要设位置”*“，使用客户端的origin，另一个修改请求时的credentials模式。看了下xhr好像不能设置，fetch可以配置。

```html
credentials
The request credentials you want to use for the request: omit, same-origin, or include. The default is same-origin.
```
通过fetch请求

```javascript
(async () => {
  const res = await fetch('http://localhost:3080/search?name=aa', {
    credentials: 'omit',
  });
  console.log(`res`, res);
})();

```

虽然两种都可以解决，但是像跨域这种问题本身就包含了安全的问题。在生产环境要谨慎的进行配置。或者尽量不使用。本地开发通过代理的方式，生产后在同一个域名部署。


### 总结

遇到问题先不要主观下结论，先要看报错信息，再具体分析！！