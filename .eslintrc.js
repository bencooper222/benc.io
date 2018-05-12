module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    es6: true
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: 'module',
    ecmaVersion: 8
  },
  rules: {
    'no-console': 0,
    "prettier/prettier": "error",
    "linebreak-style":["error", "unix"]

  }
};
