const parser = require("./parser");
const resolve = require("enhanced-resolve");
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
  buildModule(path) {}
  // 生成打包文件
  emitFile() {}
}

module.exports = Compiler;
