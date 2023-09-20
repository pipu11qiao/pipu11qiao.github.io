const babelParser = require("@babel/parser");
const tranverse = require("@babel/traverse");
const babel = require("@babel/core");
const fs = require("fs");

class Parser {
  parser(filePath, config) {
    const ast = this.
  }
  genAST(filePath, config) {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    const ast = babelParser.parse(sourceCode, {
      sourceType: "module", // 解析es6模块
    });
    return ast.program;
  }
}
const parser = new Parser();

module.exports = parser;
