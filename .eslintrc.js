module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "eslint-plugin-tsdoc"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    "tsdoc/syntax": "warn",
    "@typescript-eslint/no-explicit-any": 0,
  },
};
