/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param numbers int整型一维数组
 * @return int整型
 */
function duplicate(numbers) {
  // write code here
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return -1;
  }
  let mem = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const cur = numbers[i];
    if (mem.get(cur)) {
      return cur;
    }

    mem.set(cur, 1);
  }

  return -1;
}
module.exports = {
  duplicate: duplicate,
};

function test() {
  let fun = duplicate;
  let params = [[2, 3, 1, 0, 2, 5, 3]];

  const res = fun.apply(null, params);
  console.log(`res`, res);
}
test();
