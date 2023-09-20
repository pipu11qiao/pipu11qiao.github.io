const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");
const fs = require("fs");
const util = require("./util");
const resolve = require("enhanced-resolve");
const path = require("path");

class Parser {
  parse(filePath, config) {
    const ast = this.genAST(filePath, config);
    const dependencies = [];
    const dirname = path.dirname(filePath);
    traverse(ast, {
      CallExpression({ node }) {
        if (node.callee.name === "require") {
          const releativePath = node.arguments[0].value;
          const curfilePath = resolve.sync(dirname, releativePath);
          const key = util.getKey(config.root, curfilePath);
          node.arguments[0].value = key;
          dependencies.push(key);
        }
      },
      ImportDeclaration({ node }) {
        const curfilePath = resolve.sync(dirname, node.source.value);
        const key = util.getKey(config.root, curfilePath);
        node.source.value = key;
        dependencies.push(key); //加入依赖数组
      },
    });
    const { code } = babel.transformFromAst(ast, null, {
      //基于ast生成es5代码
      presets: ["@babel/preset-env"],
    });
    return {
      //返回解析后的es5代码和依赖数组
      code,
      dependencies,
    };
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
