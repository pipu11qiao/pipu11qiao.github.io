module.exports = {
  extends: [require.resolve('@umijs/max/eslint'), 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'max-lines': [
      'warn',
      { max: 800, skipBlankLines: true, skipComments: true },
    ],
  },
};
