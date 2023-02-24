async function sendRequest(urls, max, callback) {
  let res = [];
  let len = urls.length;
  let finishedCount = 0;
  let index = 0;
  async function getUrl(url, curIndex) {
    let cur = await myFetch(url);
    res[curIndex] = cur;
    finishedCount++;
    if (finishedCount === len) {
      callback(res);
    }
    if (index < len) {
      getUrl(urls[index], index);
      index++;
    }
  }
  for (let i = 0; i < len && i < max; i++) {
    getUrl(urls[i], i);
    index++;
  }
}
function myFetch(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(url);
    }, 100);
  });
}

sendRequest(["1", "3", "2", "4", "7", "8", "9"], 3, (res) => {
  console.log("res", res);
});
