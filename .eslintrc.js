module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn",
  },
  overrides: [
    {
      files: ["apps/web/**/*"],
      extends: ["next/core-web-vitals"],
    },
    {
      files: ["apps/mobile/**/*"],
      extends: ["@react-native-community"],
    },
  ],
};
