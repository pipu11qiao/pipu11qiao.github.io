/*function TreeLinkNode(x){
    this.val = x;
    this.left = null;
    this.right = null;
    this.next = null;
}*/
function GetNext(pNode, val) {
  let node = pNode;
  if (!node) {
    return null;
  }
  // 如果节点有右子节点，取右子节点的最左边元素
  if (node.right) {
    let curNode = node.right;
    while (curNode.left) {
      curNode = curNode.left;
    }
    return curNode;
  }
  // 否则判断节点是否有父元素  有父元素并且是父元素的左子节点，返回父元素
  while (node.next) {
    if (node.next.left === node) {
      return node.next;
    }
    node = node.next;
  }
  // 返回null
  return null;
}
module.exports = {
  GetNext: GetNext,
};
