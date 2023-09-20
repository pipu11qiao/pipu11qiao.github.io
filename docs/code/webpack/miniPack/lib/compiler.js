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
    this.config.root = this.execPath;
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
    const { code, dependencies } = parser.parse(filePath, this.config);
    // 根据文件源码和它的依赖数组生成module，并加入到依赖集合中
    this.modules[key] = {
      code,
      dependencies,
    };
    // 遍历文件的依赖数组，递归执行buildModule方法，直到遍历完所有的依赖文件，这时this.modules中将是项目所有依赖module的集合
    dependencies.forEach((dependency) => {
      const absPath = resolve(this.execPath, dependency);
      this.buildModule(absPath);
    });
  }
  // 生成打包文件
  emitFile() {}
}

module.exports = Compiler;
