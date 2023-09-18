const path = require("path");

module.exports = {
  mode: "development",
  //   entry: {
  //     a: "./src/a.js",
  //     b: "./src/b.js",
  //   },
  entry: {
    A: ["./src/entry1.js", "./src/entry2.js"],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist"),
  },
};
