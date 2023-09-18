const arr = [];

function recordFun(fun) {
  let name = fun.name;
  return (...args) => {
    const fnInfo = {
      name: fun.name,
      arguments: args,
    };
    arr.push(fnInfo);
    fun();
  };
}
function a() {
  console.log("a");
}
a = recordFun(a);

function b() {
  console.log("b");
  a("aa");
}
b = recordFun(b);

function c() {
  console.log("c");
  b("bb");
}
c = recordFun(c);

c("cc");
console.log(`arr`, arr);
