function TreeNode(x) {
  this.val = x;
  this.left = null;
  this.right = null;
}

/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param preOrder int整型一维数组
 * @param vinOrder int整型一维数组
 * @return TreeNode类
 */
function reConstructBinaryTree(preOrder, vinOrder) {
  // write code here
  if (
    !Array.isArray(preOrder) ||
    preOrder.length === 0 ||
    !Array.isArray(vinOrder) ||
    vinOrder.length === 0
  ) {
    return null;
  }
  let first = preOrder[0];
  let index = vinOrder.indexOf(first);
  let leftVinOrder = vinOrder.slice(0, index);
  let rightVinOrder = vinOrder.slice(index + 1);
  let node = new TreeNode(first);
  node.left = reConstructBinaryTree(
    preOrder.slice(1, leftVinOrder.length + 1),
    leftVinOrder
  );
  node.right = reConstructBinaryTree(
    preOrder.slice(preOrder.length - rightVinOrder.length),
    rightVinOrder
  );
  return node;
}
module.exports = {
  reConstructBinaryTree: reConstructBinaryTree,
};

function test() {
  let fun = reConstructBinaryTree;
  let params = [
    //[1, 1, 1, 0]
    [1, 2, 4, 7, 3, 5, 6, 8],
    [4, 7, 2, 1, 5, 3, 8, 6],
  ];

  const res = fun.apply(null, params);
  console.log(`res`, res);
}
test();
