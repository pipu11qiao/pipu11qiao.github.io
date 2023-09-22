module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'value-no-vendor-prefix': null, // 实现多行文字溢出展示省略号时，打开此规则会报错
  },
};
