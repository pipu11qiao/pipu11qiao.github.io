const path = require("path");

module.exports = {
  getKey(root, filePath) {
    let key = path.relative(root, filePath);
    key = "./" + key.replace(/\\/g, "/");
    return key;
  },
};
