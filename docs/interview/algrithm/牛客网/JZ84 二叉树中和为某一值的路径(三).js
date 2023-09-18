/*
 * function TreeNode(x) {
 *   this.val = x;
 *   this.left = null;
 *   this.right = null;
 * }
 */

/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param root TreeNode类
 * @param sum int整型
 * @return int整型
 */
function FindPath(root, sum) {
  // write code here
  let count = 0;
  function pre(node, arr) {
    console.log(`arr`, arr);
    if (!node) {
      return;
    }
    if (node.val === sum) {
      count++;
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i] += node.val;
      if (arr[i] === sum) {
        count++;
      }
    }
    arr.push(node.val);
    pre(node.left, arr);
    pre(node.right, arr);
    arr.pop();
    for (let i = 0; i < arr.length; i++) {
      arr[i] -= node.val;
    }
  }
  pre(root, []);
  return count;
}
module.exports = {
  FindPath: FindPath,
};
