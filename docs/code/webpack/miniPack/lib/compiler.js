const parser = require("./parser");
const resolve = require("enhanced-resolve");
const path = require("path");
const util = require("./util");
class Compiler {
  constructor(config) {
    this.config = config;
    this.entry = config.entry;
    this.output = config.output;
    this.execPath = process.cwd(); // 当前工作目录
    this.modules = Object.create(null); // 基于module依赖得到集合
  }
  run() {
    this.buildModule(resolve.sync(this.execPath, this.entry));
    this.emitFile();
  }
  // 构建依赖关系图
  buildModule(filePath) {
    const key = util.getKey(this.execPath, filePath);
    if (this.modules[key]) {
      return;
    }

    // 解析文件，得到转换的es5的文件源码和它的依赖数组
    const {} = parser.parse(filePath, this.config);
    resolve(this.execPath);
  }
  // 生成打包文件
  emitFile() {}
}

module.exports = Compiler;
