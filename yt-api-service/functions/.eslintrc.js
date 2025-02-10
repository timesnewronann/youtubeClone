module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // ✅ Ensures ESLint and Prettier work together
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["prettier"], // ✅ Add Prettier as a plugin
  rules: {
    "prettier/prettier": "error", // ✅ Enables Prettier linting
  },
  ignorePatterns: ["lib/**/*.js", ".eslintrc.js"], // ✅ Ignore compiled JS files and ESLint config
};
