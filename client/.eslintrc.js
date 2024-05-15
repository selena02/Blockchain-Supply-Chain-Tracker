module.exports = {
  env: {
    browser: true,
    es2020: true, // This enables BigInt and other ES2020 features
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    // Your custom rules can go here
  },
};
