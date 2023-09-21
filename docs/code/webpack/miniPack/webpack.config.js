const path = require("path");
const HtmlPlugin = require("./lib/plugins/HtmlPlugin");

module.exports = {
  mode: "none",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // path.resolve(__dirname, "lib/loaders/remove-console-loader.js"),
          path.resolve(__dirname, "lib/loaders/add-author-loader.js"),
        ],
      },
    ],
  },
  plugins: [
    new HtmlPlugin({
      template: "./src/index.html", // 用到的模版文件
      filename: "newIndex.html", // 生成html文件命名
    }),
  ],
};
