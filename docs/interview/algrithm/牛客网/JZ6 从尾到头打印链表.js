/*function ListNode(x){
    this.val = x;
    this.next = null;
}*/
function printListFromTailToHead(head) {
  // write code here
  let arr = [];
  while (head) {
    arr.push(head.val);
    head = head.next;
  }
  arr.reverse();
  return arr;
}
module.exports = {
  printListFromTailToHead: printListFromTailToHead,
};

function test() {
  let fun = printListFromTailToHead;
  let params = [
    //[1, 1, 1, 0]
  ];

  const res = fun.apply(null, params);
  console.log(`res`, res);
}
test();
