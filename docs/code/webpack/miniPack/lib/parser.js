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
  initLoader(filePath, config) {
    let source = fs.readFileSync(filePath, "utf-8");
    const rules = config.module && config.module.rules; // 获取rules数组
    rules &&
      rules.forEach((rule) => {
        // 遍历rule
        const { test, use } = rule; // 获取匹配规则和loader数组
        let l = use.length - 1;
        if (test.test(filePath)) {
          function execLoader() {
            const loader = require(use[l--]); // 从最后一个loader执行，loader的执行顺序是从右到左
            source = loader(source);
            if (l >= 0) {
              execLoader();
            }
          }
          execLoader();
        }
      });
    return source;
  }
  genAST(filePath, config) {
    const sourceCode = this.initLoader(filePath, config);
    const ast = babelParser.parse(sourceCode, {
      sourceType: "module", // 解析es6模块
    });
    return ast.program;
  }
}

const parser = new Parser();

module.exports = parser;
