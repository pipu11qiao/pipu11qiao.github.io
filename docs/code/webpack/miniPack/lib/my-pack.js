const path = require("path");
const Compiler = require("./compiler");
const resolve = require("enhanced-resolve");

let configPath = resolve.sync(process.cwd(), "./webpack.config.js");

//获取命令行参数，如指定了--config，则获取紧跟其后的配置文件名
const argv = process.argv;
const index = argv.findIndex((value) => value === "--config");
if (index >= 0 && argv[index + 1]) {
  configPath = path.resolve(process.cwd(), argv[index + 1]);
}
const config = require(configPath);
const compiler = new Compiler(config);

compiler.run();
