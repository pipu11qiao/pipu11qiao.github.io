/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param target int整型
 * @param array int整型二维数组
 * @return bool布尔型
 */
function Find(target, array) {
  // write code here
  if (
    !Array.isArray(array) ||
    array.length === 0 ||
    !Array.isArray(array[0]) ||
    array[0].length === 0
  ) {
    return false;
  }
  const m = array.length;
  const n = array[0].length;
  let row = 0;
  let col = n - 1;
  while (row < m && col >= 0) {
    let curNum = array[row][col];
    if (curNum === target) {
      return true;
    } else if (curNum > target) {
      col--;
    } else {
      row++;
    }
  }
  return false;
}
module.exports = {
  Find: Find,
};

function test() {
  let fun = Find;
  let params = [
    // 7,
    // [
    //   [1, 2, 8, 9],
    //   [2, 4, 9, 12],
    //   [4, 7, 10, 13],
    //   [6, 8, 11, 15],
    // ],

    3,
    [
      [1, 2, 8, 9],
      [2, 4, 9, 12],
      [4, 7, 10, 13],
      [6, 8, 11, 15],
    ],
  ];

  const res = fun.apply(null, params);
  console.log(`res`, res);
}
test();
