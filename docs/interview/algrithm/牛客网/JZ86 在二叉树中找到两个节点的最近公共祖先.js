/*
 * function TreeNode(x) {
 *   this.val = x;
 *   this.left = null;
 *   this.right = null;
 * }
 */
function findList(node, v, arr) {
  if (node) {
    arr.push(node);
    if (node.val === v) {
      return arr;
    } else {
      let curRes = findList(node.left, v, arr);
      if (curRes) {
        return curRes;
      }
      curRes = findList(node.right, v, arr);
      if (curRes) {
        return curRes;
      }
    }
    arr.pop();
  }
}
/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param root TreeNode类
 * @param o1 int整型
 * @param o2 int整型
 * @return int整型
 */
function lowestCommonAncestor(root, o1, o2) {
  // write code here
  let arr1 = findList(root, o1, []);
  let arr2 = findList(root, o2, []);
  console.log(`arr1`, arr1);
  console.log(`arr2`, arr2);
  let len = Math.min(arr1.length, arr2.length);
  let node = root;
  for (let i = 1; i < len; i++) {
    if (arr1[i].val !== arr2[i].val) {
      return node.val;
    } else {
      node = arr1[i];
    }
  }
  return node.val;
}
module.exports = {
  lowestCommonAncestor: lowestCommonAncestor,
};
