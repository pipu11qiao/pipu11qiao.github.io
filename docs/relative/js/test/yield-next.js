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
