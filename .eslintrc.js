module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es6': true
  },
  'parserOptions': {
    'ecmaVersion': 9,
    'sourceType': 'module'
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'eol-last': ['error', 'always'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'require-atomic-updates': 'off',
    'no-console': 'off',
    'no-trailing-spaces': 'error'
  },
  'globals': {
    'describe': false,
    'beforeEach': false,
    'afterEach': false,
    'jasmine': false,
    'it': false,
    'expect': false
  }
};
